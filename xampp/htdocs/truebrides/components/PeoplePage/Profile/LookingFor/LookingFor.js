/* eslint-disable react/no-unescaped-entities */
import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { Input, Row, Col, Typography, Button, Modal, Select, Form } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ageGroup1, ageGroup2 } from "@config/staticData";
import { useSelector } from "react-redux";
import "./LookingFor.module.less";
import { cloneDeep, isEmpty, size, map } from "lodash";
import { ChatContext, Notify } from "@components";
import fetchHelper from "@redux/utils/apiHelper";
import Paragraph from "antd/lib/typography/Paragraph";
import useCurrentScreen from "@redux/utils/useCurrentScreen";

const { Text } = Typography;
const { Option } = Select;

function LookingFor(props) {
  const cc = useContext(ChatContext);
  const { editable, data, onUpdate } = props;
  const { userData, token } = useSelector((state) => state.auth);
  const type = data?.user?.userType;
  const preferences =
    data?.user?.userType === "Male"
      ? data?.femalePreferences
      : data?.malePreferences;
  const [modal, setModal] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [ellipsis, setEllipsis] = useState(true);
  const MenOrWomen = type === "Male" ? "Women" : "Men";
  const currentBP = useCurrentScreen();
  const isMobile = ["xs"].includes(currentBP);

  const onFinish = async (values) => {
    let dd = cloneDeep(data);
    map(values, (v, k) => {
      if (!isEmpty(v) || !isNaN(v)) {
        dd[k] = v;
      }
    });

    let url = `${userData?.userType}s`;
    setBtnLoader(true);
    try {
      const res = await fetchHelper(url, dd, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        Notify("success", "Success!", "Profile details updated successfully");
        onUpdate();
      } else {
        if (res.message || res.Message) {
          Notify("error", "Oops!", res.message || res.Message);
        }
      }
      setBtnLoader(false);
      setModal(false);
    } catch (error) {
      setBtnLoader(false);
      console.log(error);
    }
  };
  return (
    <Row className="rowLookingFor">
      <Col span={24} className="contentdataCol">
        <div className="titleIconDiv">
          <span className="spanBtnIcon">
            <Text
              className={cc?.isChatOpen ? "mySelfText_active" : "myselfText"}
            >
              I'm Looking for
            </Text>
            {editable ? (
              <span className="roundCircleSpan" onClick={() => setModal(true)}>
                <EditOutlined className="editIcon" />
              </span>
            ) : null}
          </span>
          {preferences && size(preferences.toString()) > 171 ? (
            <Button
              type="link"
              className="siderShowBtn"
              onClick={() => setEllipsis(!ellipsis)}
            >
              {ellipsis ? "More" : "Less"}
            </Button>
          ) : null}
        </div>
        <Row>
          <Text className="lookingforText">
            {MenOrWomen},{" "}
            {data?.upperAgeLimit === 0
              ? `${data?.lowerAgeLimit || 18} years and older`
              : `between ${data?.lowerAgeLimit || 18} and
            ${data?.upperAgeLimit} years`}
          </Text>
        </Row>
        <Row>
          <Paragraph
            className="aboutmeAnswers withAbout"
            ellipsis={
              ellipsis
                ? {
                    rows: 5,
                    onEllipsis: (e) => setEllipsis(e),
                  }
                : false
            }
          >
            {preferences ? preferences : "No Answer"}
          </Paragraph>
        </Row>
      </Col>
      <Modal
        visible={modal}
        onCancel={() => setModal(false)}
        footer={null}
        zIndex={10}
        className="the_new_class"
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Form name="LookingforModalForm" onFinish={onFinish}>
          <div className="rowLookingForClass">
            <div className="LookinForOptionRow">
              <div id="lookingArea" style={{ position: "relative" }}>
                <Form.Item
                  colon={false}
                  label={
                    isMobile ? (
                      <div className="mobile_flex">
                        <span>{`Looking for ${
                          type === "Male" ? "Women" : "Men"
                        }`}</span>
                        <span>{"Between ages"}</span>
                      </div>
                    ) : (
                      `Looking for ${
                        type === "Male" ? "Women" : "Men"
                      } Between ages`
                    )
                  }
                  className="lookingforLabel ages_class"
                  name="lowerAgeLimit"
                  initialValue={data?.lowerAgeLimit || 18}
                >
                  <Select
                    getPopupContainer={() =>
                      document.getElementById("lookingArea")
                    }
                  >
                    {ageGroup1.map((age) => {
                      return (
                        <Option value={age} key={age.toString()}>
                          {age.toString()}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </div>
              <div id="ageArea" style={{ position: "relative" }}>
                <Form.Item
                  colon={false}
                  label="and"
                  className="lookingforLabel and ages_class"
                  name="upperAgeLimit"
                  initialValue={data?.upperAgeLimit || 80}
                >
                  <Select
                    getPopupContainer={() => document.getElementById("ageArea")}
                  >
                    {ageGroup2.map((age) => {
                      return (
                        <Option value={age} key={age.toString()}>
                          {age.toString()}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>
          <Form.Item
            initialValue={preferences}
            name={
              data?.user?.userType === "Male"
                ? "femalePreferences"
                : "malePreferences"
            }
            rules={[
              {
                required: true,
                message: "Please enter details your ideal partner",
              },
              {
                max: 500,
                message: "Maximum 500 characters are allowed",
              },
            ]}
          >
            <Input.TextArea
              placeholder="A few words about your ideal relationship"
              className="lookingfoTextArea"
            />
          </Form.Item>
          <Form.Item className="formSaveBtn">
            <Button
              className="coverSavetBtn"
              htmlType="submit"
              disabled={btnLoader}
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

LookingFor.defaultProps = {
  editable: false,
  data: {},
  onUpdate: () => {},
};

LookingFor.propTypes = {
  editable: PropTypes.bool,
  data: PropTypes.object,
  onUpdate: PropTypes.func,
};

export default LookingFor;
