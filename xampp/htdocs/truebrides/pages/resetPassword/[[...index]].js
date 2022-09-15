import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col, Button, Form, Input } from "antd";
import { Header, Notify } from "@components";
import { has, isEmpty } from "lodash-es";
import useWindowDimensions from "@config/dimensions";
import fetchHelper from "@redux/utils/apiHelper";
import "@pageStyles/landingPage.module.less";
import "./resetPassword.module.less";

function resetPassword() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { windowWidth } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [btnLoading, setBtnLoading] = useState(false);
  const [popOverIndex, setPopOverIndex] = useState(null);
  const [confirmPass, setConfirmPass] = useState(""); // use only for validation purpose
  const [confirmPassError, setConfirmPassError] = useState({}); // use only for validation purpose

  const passMatchError = {
    help: "Password and confirm passwords do not match",
    validateStatus: "error",
  };

  useEffect(() => {
    if (
      !has(router.query, "userId") ||
      !has(router.query, "resetPasswordToken")
    ) {
      router.replace("/");
    }
  }, []);

  useEffect(() => {
    checkValidation();
  }, [confirmPass]);

  const checkValidation = () => {
    if (
      !isEmpty(confirmPass) &&
      confirmPass !== form.getFieldValue("newPassword")
    ) {
      setConfirmPassError(passMatchError);
    } else {
      setConfirmPassError({});
    }
  };

  const handleChangePassword = async (values) => {
    if (!isEmpty(confirmPassError)) {
      return;
    }
    let url = "Login/ResetPassword";
    const data = {
      userId: router.query?.userId || "",
      resetPasswordToken:
        encodeURIComponent(router.query?.resetPasswordToken) || "",
      newPassword: values.newPassword,
    };
    setBtnLoading(true);
    try {
      const res = await fetchHelper(url, data, "PUT");
      if (res) {
        Notify("success", "Success!", "Password changed successfully");
        router.replace("/");
        setPopOverIndex(null);
      } else {
        if (res.message || res.Message) {
          Notify("error", "Oops!", res.message || res.Message);
        }
      }
      setBtnLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setWidth(windowWidth);
  }, [windowWidth]);

  const renderBody = () => {
    return (
      <div className="mainBody">
        <Row justify="center">
          <Col
            xs={22}
            sm={18}
            md={12}
            lg={8}
            xl={6}
            className="verificationContainer"
          >
            <Row justify="start">
              <Col span={24}>
                <Form
                  onFieldsChange={() => checkValidation()}
                  form={form}
                  name="RecoverForm textLeft"
                  style={{ borderRadius: 10 }}
                  onFinish={handleChangePassword}
                  size="large"
                >
                  <Form.Item
                    name="newPassword"
                    className="signFormItem"
                    rules={[
                      { required: true, message: "Please enter password" },
                      {
                        min: 6,
                        max: 15,
                        message: "Password must be between 6 to 15 characters",
                      },
                    ]}
                  >
                    <Input type="password" placeholder="New Password" />
                  </Form.Item>
                  <Form.Item
                    {...confirmPassError}
                    name="confirmPassword"
                    className="signFormItem"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your password",
                      },
                    ]}
                  >
                    <Input type="password" placeholder="Confirm Password" />
                  </Form.Item>
                  <Form.Item className="checkBoxClickItem">
                    <Button
                      disabled={btnLoading}
                      loading={btnLoading}
                      className="loginButtons"
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                    >
                      Reset Password
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>TrueBrides: Online Dating Site to Meet Beautiful Women Abroad</title>
      </Head>
      <div className="mainLayout" style={{ maxWidth: width }}>
        <Row style={{ backgroundColor: "white" }}>
          <Col
            xs={{ offset: 0, span: 24 }} //mobile
            md={{ offset: 1, span: 22 }} //tablet
            lg={{ offset: 2, span: 20 }} //laptop
            xl={{ offset: 4, span: 16 }} //pc > 1440px
            className="iconCol"
          >
            <Header
              pIndex={popOverIndex}
              onIndexChange={(i) => {
                setPopOverIndex(i);
              }}
            />
          </Col>
        </Row>
      </div>
      {renderBody()}
    </>
  );
}

export default resetPassword;
