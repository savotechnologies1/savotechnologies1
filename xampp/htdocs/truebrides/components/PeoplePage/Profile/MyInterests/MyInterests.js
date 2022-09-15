import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { cloneDeep, isEmpty, map } from "lodash-es";
import { Form, Row, Col, Typography, Button, Skeleton, Modal } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import fetchHelper from "@redux/utils/apiHelper";
import { Notify } from "@components";
import "./MyInterests.module.less";

const { Text } = Typography;

function MyInterests(props) {
  const { editable, data, onUpdate } = props;
  const { userData, token, searchOptions } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    initialData();
  }, [data]);

  const interestsList = useMemo(() => {
    return searchOptions.find((o) => o.code === "INTERESTS")?.data;
  }, [searchOptions, data]);

  const handleInterest = (option) => {
    const removeIndex = selectedInterests.findIndex((o) => o.id === option.id);
    if (removeIndex === -1) {
      selectedInterests.push(option);
    } else {
      selectedInterests.splice(removeIndex, 1);
    }
    setSelectedInterests([...selectedInterests]);
  };

  const initialData = () => {
    let sList = [];
    if (data && data?.interests && !isEmpty(data.interests)) {
      map(data.interests, (v) => {
        map(interestsList, (o) => {
          if (o.value === v) {
            sList.push(o);
          }
        });
      });
      if (!isEmpty(sList)) {
        setSelectedInterests(sList);
      }
    }
  };

  const onFinish = async () => {
    const newData = cloneDeep(data);

    newData.interests = selectedInterests.map((i) => i.value);

    let url = `${userData?.userType}s`;
    setBtnLoader(true);
    try {
      const res = await fetchHelper(url, newData, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        Notify("success", "Success!", "Profile details updated successfully");
        onUpdate();
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong!"
        );
      }
      setBtnLoader(false);
      setLoading(false);
      setModal(false);
    } catch (error) {
      setBtnLoader(false);
      setLoading(false);
      setModal(false);
      console.log(error);
    }
  };

  return (
    <Row className="rowMyInterests">
      <Col span={24} className="contentdataCol">
        <div className="titleIconDiv">
          <span className="spanBtnIcon">
            <Text className="myselfText">My Hobbies</Text>
            {editable ? (
              <span className="roundCircleSpan" onClick={() => setModal(true)}>
                <EditOutlined className="editIcon" />
              </span>
            ) : null}
          </span>
          <Button
            type="link"
            className="siderShowBtn"
            onClick={() => {
              showAll ? setShowAll(false) : setShowAll(true);
            }}
          >
            {selectedInterests.length > 5
              ? showAll
                ? "Less"
                : "See all"
              : null}
          </Button>
        </div>
        <Row className={`renderDataRow ${showAll && "renderDataRow-active"}`}>
          {loading ? (
            [...new Array(5)].map((item, ind) => {
              if (!showAll && ind > 4) {
                return;
              }
              return (
                <Col span={item} key={ind}>
                  <Skeleton.Button
                    className="skeletonButton"
                    loading={loading}
                    title={false}
                    paragraph={{
                      rows: 1,
                      width: "10%",
                    }}
                  />
                </Col>
              );
            })
          ) : !isEmpty(selectedInterests) ? (
            <>
              {selectedInterests.map((item, index) => {
                if (!showAll && index > 4) {
                  return;
                }
                return (
                  <>
                    <Col>
                      <div className="interestsDataDiv">
                        {!isEmpty(item.description) && (
                          <i
                            className={item.description}
                            aria-hidden="true"
                            style={{ marginRight: 8, color: "#ea4550" }}
                          ></i>
                        )}
                        <Text className="interestRowData">{item.value}</Text>
                      </div>
                    </Col>
                  </>
                );
              })}
            </>
          ) : (
            [...new Array(5)].map((item, ind) => {
              if (!showAll && ind > 4) {
                return;
              }
              return (
                <Col span={item} key={ind}>
                  <Skeleton.Button
                    className="skeletonButton"
                    loading={loading}
                    title={false}
                    paragraph={{
                      rows: 1,
                      width: "10%",
                    }}
                  />
                </Col>
              );
            })
          )}
        </Row>
      </Col>
      <Modal
        visible={modal}
        onCancel={() => {
          initialData();
          setModal(false);
        }}
        footer={null}
        zIndex={10}
        className="the_new_class noselect"
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Form
          name="myinterestForm"
          labelCol={{ span: 24 }}
          colon={false}
          onFinish={onFinish}
        >
          <Form.Item name="options">
            <Row className="myInterestsRow">
              {!isEmpty(interestsList) && interestsList
                ? interestsList.map((item, index) => {
                    const isSelected =
                      selectedInterests.findIndex((o) => o.id === item.id) !==
                      -1;
                    return (
                      <Col
                        key={index}
                        offset={1}
                        span={7}
                        md={{ offset: 0, span: 8 }}
                        xs={{ offset: 0, span: 12 }}
                      >
                        <div
                          className={`MyinterestsItem ${
                            isSelected && "MyinterestsItem-active"
                          }`}
                          onClick={() => handleInterest(item)}
                        >
                          {!isEmpty(item.description) && (
                            <i
                              className={item.description}
                              aria-hidden="true"
                              style={{ marginRight: 8 }}
                            ></i>
                          )}
                          <Text
                            className={`myInterestsRow${
                              isSelected && "-active"
                            }`}
                          >
                            {item.value}
                          </Text>
                        </div>
                      </Col>
                    );
                  })
                : null}
            </Row>
          </Form.Item>
          <Form.Item className="formSaveBtn">
            <Button
              htmlType="submit"
              className="coverSavetBtn"
              loading={btnLoader}
            >
              SAVE
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
}

MyInterests.defaultProps = {
  editable: false,
  data: {},
  onUpdate: () => {},
};

MyInterests.propTypes = {
  editable: PropTypes.bool,
  data: PropTypes.object,
  onUpdate: PropTypes.func,
};

export default MyInterests;
