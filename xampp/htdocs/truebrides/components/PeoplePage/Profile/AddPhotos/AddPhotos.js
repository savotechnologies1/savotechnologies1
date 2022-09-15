import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import fetchHelper from "@redux/utils/apiHelper";
import {
  Row,
  Col,
  Typography,
  Button,
  Popover,
  Upload,
  Popconfirm,
  Spin,
  Modal,
} from "antd";
import {
  EllipsisOutlined,
  PictureOutlined,
  CameraOutlined,
  UnlockOutlined,
  LockOutlined,
  LockFilled,
  CameraFilled,
  CheckOutlined,
  DeleteFilled,
  DeleteOutlined,
} from "@ant-design/icons";
import siteConfig from "@config/siteConfig";
import { uploadPhoto, validateImage } from "@redux/utils/commonFunctions";
import { Notify } from "@components";
import Lightbox from "react-image-lightbox";
import Webcam from "react-webcam";
import { isEmpty } from "lodash";
import LazyLoad from "react-lazyload";
import "./AddPhotos.module.less";
import "./lightbox.module.less";
import useCurrentScreen from "@redux/utils/useCurrentScreen";

const { Text } = Typography;
function AddPhotos(props) {
  const { withUpload, photoList, onUploadSuccess, canSeePrivate } = props;
  const { token, userData } = useSelector((state) => state.auth);
  const [visible, setVisible] = useState(false);
  const [imageOpend, setImageOpend] = useState(-1);
  const [popVisible, setPopVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadLoader, setUploadLoader] = useState(false);
  const [openWebCam, setOpenWeb] = useState(false);
  const [caputedImg, setCapturedImage] = useState("");
  const [lightboxPvt, setLightBoxPvt] = useState(false); // use to apply filter on private image

  const webcamRef = useRef(null);

  const isTab = ["md"].includes(useCurrentScreen());
  const isMobile = ["xs"].includes(useCurrentScreen());

  useEffect(() => {
    setUploadLoader(false);
  }, [photoList.length]);

  useEffect(() => {
    if (photoList[imageOpend]) {
      if (
        photoList[imageOpend].private &&
        !withUpload &&
        !canSeePrivate &&
        userData.userType === "Male"
      ) {
        setLightBoxPvt(true);
      } else {
        setLightBoxPvt(false);
      }
    }
  }, [imageOpend]);

  const videoConstraints = {
    width: 600,
    height: 600,
    facingMode: "user",
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const onImageConfirm = async () => {
    const res = await fetch(caputedImg);
    const blob = await res.blob();
    const file = new File([blob], "image", { type: "image/jpeg" });
    handleImage(file);
    setOpenWeb(false);
    setCapturedImage("");
  };

  const handleImage = async (info) => {
    setVisible(false); //close menu
    setUploadLoader(true);
    const imageVal = validateImage(info);
    if (imageVal) {
      try {
        const status = await uploadPhoto(token, info);
        if (status === "success") {
          setUploadLoader(false);
          onUploadSuccess();
        }
      } catch (error) {
        setUploadLoader(false);
        console.log(error);
      }
    } else {
      setUploadLoader(false);
    }
  };

  const contentData = () => {
    return (
      <>
        <div className="rowDivPop">
          <Row>
            <Upload showUploadList={false} beforeUpload={handleImage}>
              <Button
                className="takephotoBtn"
                icon={<PictureOutlined className="fbIconBtn" />}
              >
                UPLOAD PHOTO FROM DEVICE
              </Button>
            </Upload>
          </Row>
          {!(isTab || isMobile) && (
            <Row>
              <Button
                onClick={() => {
                  setVisible(false);
                  setOpenWeb(true);
                }}
                className="takephotoBtn"
                icon={<CameraOutlined className="fbIconBtn" />}
              >
                TAKE VIA WEBCAM
              </Button>
            </Row>
          )}
        </div>
      </>
    );
  };

  const deletePost = async (item) => {
    setLoading(item.photoId);
    let url = `Photos/${item.photoId}`;
    try {
      const res = await fetchHelper(url, {}, "DELETE", {
        Authorization: `Bearer ${token}`,
      });
      if (res) {
        setConfirmLoading(true);
        setLoading(false);
        setTimeout(() => {
          setConfirmLoading(false);
          setPopVisible(false);
        }, 200);
        onUploadSuccess();
      } else {
        Notify("error", "Oops!", "Something went wrong");
      }
    } catch (error) {
      Notify("error", "Oops!", "Something went wrong");
      console.log("errorrrrrrrrrrrrrrrrrrrrrrrrr", error);
    }
  };

  const handlePrivacy = async (photo) => {
    setPopVisible(false);
    setLoading(photo.photoId);
    let url = "PhotoUsers/TogglePrivate";
    const data = {
      photoId: photo.photoId,
      userId: photo.userId,
    };
    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (res) {
        onUploadSuccess();
      } else {
        Notify("error", "Oops!", "Something went wrong");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Notify("error", "Oops!", "Something went wrong");
      console.log("error", error);
    }
  };

  return (
    <Row className="addPhotosRow" gutter={[10, 10]}>
      {withUpload ? (
        <Col xs={12} md={8} lg={6} xl={6}>
          <div className="addPhotoImg">
            <Text className="addPhotoText">Add Your Photos</Text>
            {isTab || isMobile ? (
              <Upload showUploadList={false} beforeUpload={handleImage}>
                <Button className="addPhotoBtn">ADD PHOTOS</Button>
              </Upload>
            ) : (
              <Popover
                overlayClassName="gallery_clickPopOver"
                trigger="click"
                placement="top"
                content={contentData}
                visible={visible}
                onVisibleChange={(visible) => setVisible(visible)}
              >
                <Text className="addPhotoBtn">ADD PHOTOS</Text>
              </Popover>
            )}
          </div>
        </Col>
      ) : null}
      {uploadLoader ? (
        <Col xs={12} md={8} lg={6} xl={6}>
          <Spin spinning={true}>
            <div className="addPhotoImg"></div>
          </Spin>
        </Col>
      ) : null}
      {photoList.map((item, index) => {
        let isPrivate = item.private;
        let myPrivate = withUpload && isPrivate;
        let othersPrivate =
          !withUpload &&
          isPrivate &&
          !canSeePrivate &&
          userData.userType != "Female";

        return (
          <Col xs={12} md={8} lg={6} xl={6} key={index} className="popCol">
            <Spin spinning={item.photoId === loading}>
              <Popover
                trigger="click"
                placement="bottomRight"
                overlayClassName="clickPopOver"
                visible={popVisible === item.photoId}
                onVisibleChange={(v) => (!v ? setPopVisible(false) : null)}
                content={
                  <div className="chat_blockBtn">
                    {userData.userType == "Female" && (
                      <Button
                        className="chatBlockOffBtn"
                        icon={isPrivate ? <UnlockOutlined /> : <LockOutlined />}
                        onClick={() => handlePrivacy(item)}
                      >
                        {isPrivate ? "Set as public" : "Set as private"}
                      </Button>
                    )}
                    <Popconfirm
                      overlayClassName="clickPop"
                      className="pop_class"
                      title="Are you sure you want to delete this photo?"
                      onConfirm={() => deletePost(item)}
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
                {withUpload && !item.profilePicture ? (
                  <EllipsisOutlined
                    className="menuOnPhoto"
                    onClick={() => setPopVisible(item.photoId)}
                  />
                ) : null}
              </Popover>
              <div
                className="addPhotoImgCover"
                onClick={() => setImageOpend(index)}
              >
                {myPrivate && <LockFilled className="myPrivacyIndicator" />}
                {othersPrivate && (
                  <LockFilled className="othersPrivacyIndicator" />
                )}
                <LazyLoad once>
                  <img
                    onDragStart={(e) => e.preventDefault()}
                    src={`${siteConfig.imgUrl}${item?.photo?.path}`}
                    className={`conetentImg ${
                      othersPrivate && "conetentImg-othersPrivateImage"
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                    }}
                  />
                </LazyLoad>
              </div>
            </Spin>
          </Col>
        );
      })}
      {imageOpend >= 0 && (
        <Lightbox
          wrapperClassName={`${lightboxPvt && "lightboxPvtImage"} ${
            photoList.length === 1 ? "lightboxWrapper" : ""
          }`}
          discourageDownloads
          enableZoom={false}
          imageTitle={
            lightboxPvt && "This image is private, send message to see image."
          }
          mainSrc={`${siteConfig.imgUrl}${photoList[imageOpend].photo.path}`}
          nextSrc={photoList[(imageOpend + 1) % photoList.length]}
          prevSrc={
            photoList[(imageOpend + photoList.length - 1) % photoList.length]
          }
          onCloseRequest={() => setImageOpend(-1)}
          onMovePrevRequest={() =>
            setImageOpend(
              (imageOpend + photoList.length - 1) % photoList.length
            )
          }
          onMoveNextRequest={() =>
            setImageOpend((imageOpend + 1) % photoList.length)
          }
        />
      )}
      <Modal
        className="imageViewerModal"
        visible={openWebCam}
        footer={null}
        zIndex={10}
        closable={true}
        onCancel={() => {
          setOpenWeb(false);
          setCapturedImage("");
        }}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div style={{ height: 500, width: 500, position: "relative" }}>
          {isEmpty(caputedImg) ? (
            <div className="webCamButtonWrapper">
              <Button type="link" onClick={capture} className="webCamButton">
                <CameraFilled className="webCamButtonIcon" />
              </Button>
            </div>
          ) : (
            <div className="webCamButtonWrapper">
              <Button
                type="link"
                onClick={onImageConfirm}
                className="webCamButton"
                style={{ marginRight: 20 }}
              >
                <CheckOutlined className="webCamButtonIcon" />
              </Button>
              <Button
                type="link"
                onClick={() => setCapturedImage("")}
                className="webCamButton"
              >
                <DeleteFilled className="webCamButtonIcon" />
              </Button>
            </div>
          )}
          {isEmpty(caputedImg) ? (
            <Webcam
              audio={false}
              height={500}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={500}
              videoConstraints={videoConstraints}
            />
          ) : (
            <img src={caputedImg} height={500} width={500} />
          )}
        </div>
      </Modal>
    </Row>
  );
}

AddPhotos.defaultProps = {
  canSeePrivate: false,
  withUpload: false,
  photoList: [],
  onUploadSuccess: () => {},
};

AddPhotos.propTypes = {
  canSeePrivate: PropTypes.bool,
  withUpload: PropTypes.bool,
  photoList: PropTypes.array,
  onUploadSuccess: PropTypes.func,
};

export default AddPhotos;
