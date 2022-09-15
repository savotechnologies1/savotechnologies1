import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Col,
  Row,
  Empty,
  Typography,
  message,
  Upload,
  Popover,
  Popconfirm,
  Spin,
} from "antd";
import { has, isEmpty } from "lodash";
import siteConfig from "@config/siteConfig";
import { useSelector, useDispatch } from "react-redux";
import AuthActions from "@redux/reducers/auth/actions";
import {
  validateImage,
  getBase64,
  getAttachments,
} from "@redux/utils/commonFunctions";
import {
  EllipsisOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import fetchHelper from "@redux/utils/apiHelper";
import "./Gallery.module.less";
import { Notify } from "@components";

const { Text } = Typography;
function Gallery(props) {
  const dispatch = useDispatch();
  const { setAttachments } = AuthActions;
  const { visible, dismiss, allowMultiselect, onSelect, maxLimit } = props;
  const { attachments, userData, token, appSettings } = useSelector(
    (state) => state.auth
  );

  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [popVisible, setPopVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(attachments);
  }, [attachments]);

  const handleSubmit = () => {
    if (!isEmpty(selected)) {
      onSelect(allowMultiselect ? selected : selected[0]);
      closeModal();
    } else {
      message.error("Please select an image");
    }
  };

  const handleSelection = (img) => {
    if (allowMultiselect) {
      const removeIndex = selected.findIndex((o) => o.id === img.id);
      if (removeIndex === -1) {
        if (maxLimit > 0 && selected.length >= maxLimit) {
          message.info(
            `You can not select more than ${maxLimit} images at a time.`
          );
          return;
        }
        selected.push(img);
      } else {
        selected.splice(removeIndex, 1);
      }
      setSelected([...selected]);
    } else {
      if (!isEmpty(selected) && selected[0].id == img.id) {
        setSelected([]);
      } else {
        setSelected([img]);
      }
    }
  };

  const uploadAttachment = async (dataUrl) => {
    const data = {
      dataURL: dataUrl,
      ownerId: userData.id,
      type: "Image",
    };

    let url = `Attachments`;
    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        getAttachments();
        setTimeout(() => {
          handleSelection(res);
        }, 400);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkMax = () => {
    const max = appSettings.maxAttachmentCount;
    if (attachments.length + 1 <= max) {
      return true;
    } else {
      Notify(
        "info",
        "Oops!",
        `You can add only maximum ${max} Images, To Upload Image Please Delete Some Images.`
      );
      return false;
    }
  };

  const handleUpload = async (info) => {
    let result = checkMax();
    if (!result) return;
    const imageVal = validateImage(info);
    if (imageVal) {
      getBase64(info, (imgUrl) => uploadAttachment(imgUrl));
    }
  };

  const closeModal = () => {
    dismiss();
    setSelected([]);
  };

  const deletePost = async (item) => {
    setLoading(item.id);
    let url = `Attachments/${item.id}`;
    try {
      const res = await fetchHelper(url, {}, "DELETE", {
        Authorization: `Bearer ${token}`,
      });
      if (res) {
        setConfirmLoading(true);
        setLoading(false);
        const index = attachments.findIndex((a) => a.id === item.id);
        attachments.splice(index, 1);
        dispatch(setAttachments(attachments));
        setTimeout(() => {
          setConfirmLoading(false);
          setPopVisible(false);
        }, 200);
      } else {
        Notify("error", "Oops!", "Something went wrong");
      }
    } catch (error) {
      Notify("error", "Oops!", "Something went wrong");
      console.log("errorrrrrrrrrrrrrrrrrrrrrrrrr", error);
    }
  };

  return (
    <Modal
      className="galleryModal"
      title="Gallery"
      visible={visible}
      zIndex={10}
      closable={true}
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
      }}
      onCancel={() => closeModal()}
      footer={[
        <Upload showUploadList={false} beforeUpload={handleUpload} key="select">
          <Button className="selectBtn" type="ghost">
            Select
          </Button>
        </Upload>,
        <Button
          key="submit"
          className="selectBtn"
          type="primary"
          onClick={() => handleSubmit()}
        >
          Done
        </Button>,
      ]}
    >
      <Row gutter={[8, 8]}>
        {data && !isEmpty(data) ? (
          data.map((i, index) => {
            let marked = selected.findIndex((o) => o.id === i.id) !== -1;
            return (
              <>
                <Col key={index} xs={8} sm={8} md={4} xl={4}>
                  <div className="gImgClass">
                    <Spin
                      wrapperClassName="spinning_class"
                      spinning={i.id === loading}
                    >
                      <Popover
                        trigger="click"
                        placement="bottomRight"
                        visible={popVisible === i.id}
                        onVisibleChange={(v) =>
                          !v ? setPopVisible(false) : null
                        }
                        overlayClassName="gallery_clickPopOver"
                        content={
                          <div>
                            <Popconfirm
                              overlayClassName="clickPop"
                              className="pop_class"
                              title="Are you sure you want to delete this photo?"
                              onConfirm={() => deletePost(i)}
                              okText="Yes"
                              cancelText="No"
                              placement="topRight"
                              okButtonProps={{ loading: confirmLoading }}
                            >
                              <Button
                                className="chatBlockOffBtn"
                                icon={<DeleteOutlined />}
                                onClick={() => setPopVisible(false)}
                              >
                                Delete
                              </Button>
                            </Popconfirm>
                          </div>
                        }
                        style={{ top: 10 }}
                      >
                        <EllipsisOutlined
                          className="galleryOnPhoto"
                          onClick={() => setPopVisible(i.id)}
                        />
                      </Popover>
                    </Spin>
                    {marked && (
                      <CheckCircleOutlined
                        className="selectedGImg"
                        onClick={() => handleSelection(i)}
                      />
                    )}
                    <img
                      onDragStart={(e) => e.preventDefault()}
                      onClick={() => handleSelection(i)}
                      src={`${siteConfig.imgUrl}${i.path}`}
                      className={`gImg ${marked && "gImg-selected"}`}
                    />
                  </div>
                </Col>
              </>
            );
          })
        ) : (
          <Empty
            className="empty_class"
            description={<Text>No Photos to display</Text>}
          />
        )}
      </Row>
    </Modal>
  );
}

Gallery.defaultProps = {
  visible: false,
  dismiss: () => {},
  allowMultiselect: true,
  maxLimit: 0, // 0 means unlimited
  onSelect: () => {},
};

Gallery.propTypes = {
  visible: PropTypes.bool,
  dismiss: PropTypes.func,
  allowMultiselect: PropTypes.bool,
  maxLimit: PropTypes.number,
  onSelect: PropTypes.func,
};

export default Gallery;
