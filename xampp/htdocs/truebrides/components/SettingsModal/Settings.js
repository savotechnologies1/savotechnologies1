/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import React, { useState } from "react";
import { Button, Checkbox, Col, Form, Input, Modal, Row, Select } from "antd";
import PropTypes from "prop-types";
import Text from "antd/lib/typography/Text";
import { useForm } from "antd/lib/form/Form";
import "./settings.module.less";
import fetchHelper from "@redux/utils/apiHelper";
import { useDispatch, useSelector } from "react-redux";
import { Notify } from "@components";
import { useRouter } from "next/router";
import AuthActions from "@redux/reducers/auth/actions";
import { has, isEmpty, map } from "lodash";
import { useEffect } from "react";

const { Option } = Select;

const {
  setMatchOptions,
  setUserData,
  setUserProfile,
  setUserSettings,
  setBadgeCount,
  setAttachments,
  setChatSummary,
} = AuthActions;

const validationObject = {
  validateStatus: "success",
  errorMsg: " ",
};

function Settings(props) {
  const { dismiss, visible } = props;
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, timezoneList, userSettings, userData } = useSelector(
    (state) => state.auth
  );

  const [btnLoading, setBtnLoading] = useState(false);
  const [form] = useForm();
  const [form2] = useForm();
  const [emailNotify, setEmailNotify] = useState(false);
  const [hideNotification, setHideNotification] = useState(false);
  const [newsNotify, setNewsNotify] = useState(false);
  const [likeNotify, setLikeNotify] = useState(false);

  useEffect(() => {
    setHideNotification();
    if (!isEmpty(userSettings)) {
      setEmailNotify(userSettings?.alertEmail);
      setHideNotification(userSettings?.hideNotifications);
      setNewsNotify(userSettings?.sendNews);
      setLikeNotify(userSettings?.alertFavorites);
    }
  }, [userSettings]);

  const handleDeactive = async () => {
    let url = `App/Deactivate`;
    try {
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (res) {
        Notify("success", "Account Deactivated Successfully");
        router.replace("/");
        dispatch(setUserData("", {}));
        dispatch(setUserProfile({}));
        dispatch(setMatchOptions({}));
        dispatch(setAttachments([]));
        dispatch(setChatSummary([]));
        dispatch(
          setBadgeCount({
            inbox: 0,
            starred: 0,
            sent: 0,
            draft: 0,
            trash: 0,
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChanges = async (newSettings) => {
    const data = {
      ...userSettings,
      ...newSettings,
    };
    let url = `UserSettings/Change`;
    try {
      const res = await fetchHelper(url, data, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (res && !has(res, "ErrorCode")) {
        const newUpdate = { ...userSettings };
        map(res, (v, k) => {
          map(userSettings, (V, K) => {
            if (k === K) {
              newUpdate[k] = v;
            }
          });
        });
        dispatch(setUserSettings(newUpdate));
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const confirm = () => {
    Modal.confirm({
      title: "Are you sure you want to deactivate your account permanently?",
      onOk() {
        handleDeactive();
        Modal.destroyAll();
        dismiss();
      },
    });
  };

  const changePassword = async (values) => {
    const data = {
      old_password: values.old_password,
      password: values.password,
    };

    let url = `App/ChangePassword?OldPassword=${values.old_password}&NewPassword=${values.password}`;
    try {
      const res = await fetchHelper(url, data, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      setBtnLoading(true);
      if (res && !has(res, "ErrorCode")) {
        dismiss();
        form.resetFields();
        form2.resetFields();
        Notify("success", "Success!!", "Your password successfully change");
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || "Old password is wrong" || "Something went wrong"
        );
      }
      setBtnLoading(false);
    } catch (error) {
      setBtnLoading(false);
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        className="settingsModal"
        visible={visible}
        footer={null}
        onCancel={() => {
          dismiss();
          form.resetFields();
          form2.resetFields();
        }}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div>
          <Row justify="center" align="top">
            <Text className="mtitleText">Settings</Text>
          </Row>
        </div>
        <div>
          <Row justify="start" align="middle" className="mItemRow">
            <Col span={24}>
              <Text className="msubtitleText">Email</Text>
            </Col>
            <Col span={24}>
              <Text>{userData.email}</Text>
            </Col>
          </Row>
          <Row
            justify="space-between"
            align="top"
            style={{ marginTop: 8, marginLeft: 8, marginRight: 8 }}
          >
            <Col span={24}>
              <Text className="msubtitleText">Change Password</Text>
            </Col>
            <Col span={16}>
              <Form
                form={form}
                style={{ display: "content !important" }}
                onFinish={changePassword}
              >
                <Form.Item
                  className="settingsFormItem"
                  style={{ marginTop: 8, marginBottom: 0 }}
                  name="old_password"
                  rules={[
                    { required: true, message: "Please enter old password" },
                    {
                      max: 15,
                      message: "Maximum 15 characters are allowed",
                    },
                  ]}
                >
                  <Input type="password" placeholder="Old Password" />
                </Form.Item>
                <Form.Item
                  className="settingsFormItem"
                  style={{ marginTop: 8, marginBottom: 0 }}
                  name="password"
                  rules={[
                    { required: true, message: "Please enter new password" },
                    {
                      min: 6,
                      max: 15,
                      message:
                        "New Password must be between 6 to 15 characters",
                    },
                  ]}
                >
                  <Input type="password" placeholder="New Password" />
                </Form.Item>
                <Form.Item>
                  <Button
                    disabled={btnLoading}
                    loading={btnLoading}
                    style={{ height: 37, marginTop: 8 }}
                    className="loginButtons bradius"
                    type="primary"
                    block
                    size="middle"
                    htmlType="submit"
                  >
                    Change
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            <Col span={7}></Col>
          </Row>
          <Row justify="start" align="middle" className="mItemRow">
            <Col span={24}>
              <Text className="msubtitleText">Notifications</Text>
            </Col>
            <Col span={24}>
              <Checkbox
                checked={hideNotification}
                onChange={(e) =>
                  handleChanges({ hideNotifications: e.target.checked })
                }
              >
                Hide Notification
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox
                checked={emailNotify}
                onChange={(e) =>
                  handleChanges({ alertEmail: e.target.checked })
                }
              >
                Email Notification
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox
                checked={newsNotify}
                onChange={(e) => handleChanges({ sendNews: e.target.checked })}
              >
                Send News
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox
                checked={likeNotify}
                onChange={(e) =>
                  handleChanges({ alertFavorites: e.target.checked })
                }
              >
                Notify when users likes me
              </Checkbox>
            </Col>
          </Row>
          <Row
            justify="space-between"
            align="top"
            style={{ marginTop: 8, marginLeft: 8, marginRight: 8 }}
          >
            <Col span={24}>
              <Text className="msubtitleText">Change timezone</Text>
            </Col>
            <Col span={24}>
              <Form form={form2} style={{ display: "content !important" }}>
                <Form.Item
                  initialValue={userSettings?.timezoneId}
                  className="settingsFormItem"
                  style={{ marginTop: 8, marginBottom: 0 }}
                >
                  <Select
                    onChange={(v) => handleChanges({ timezoneId: v })}
                    placeholder="Your timezone"
                    defaultValue={userSettings?.timezoneId}
                  >
                    {!isEmpty(timezoneList) &&
                      timezoneList.map((v) => {
                        return (
                          <Option value={v.value} key={v.value}>
                            {v.label}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row justify="start" align="middle" className="mItemRow">
            <Col span={24}>
              <Text className="msubtitleText">Deactive Profile</Text>
            </Col>
            <Col span={24}>
              Click
              <a onClick={confirm}>&nbsp;here&nbsp;</a>
              to deactivate your account.
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
}

Settings.defaultProps = {
  dismiss: () => {},
  visible: false,
  receiverId: null,
};

Settings.propTypes = {
  dismiss: PropTypes.func,
  visible: PropTypes.bool,
  receiverId: PropTypes.number,
};

export default Settings;
