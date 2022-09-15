import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { has, isEmpty } from "lodash-es";
import { useRouter } from "next/router";
import { translate } from "lang/Translate";
import {
  Row,
  Col,
  Button,
  Modal,
  Typography,
  Form,
  Input,
  Divider,
  Radio,
  Checkbox,
} from "antd";
import { HeartFilled } from "@ant-design/icons";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import fetchHelper from "@redux/utils/apiHelper";
import AuthActions from "@redux/reducers/auth/actions";
import { Notify } from "@components";
import "./Header.module.less";
import FbLogin from "@components/FacebookLogin";

const { Title, Text } = Typography;
const { setUserData } = AuthActions;

function Header(props) {
  const { pIndex, onIndexChange, token } = props;
  const popOverIndex = pIndex;
  const { matchOptions } = useSelector((state) => state.auth);
  const signModal = [0, 1, 2].includes(pIndex) || false;
  const router = useRouter();
  const initialValues = { terms: true };
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const AuthRedux = useSelector((state) => state.auth);
  const [btnLoading, setBtnLoading] = useState(false);
  const [termsChecked, setTermsChecked] = useState(true);
  //Register Form Values
  const [registerGender, setRegisterGender] = useState("");
  const currentBP = useCurrentScreen();
  const showIcons = ["sm", "xs"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);

  const handleSignin = async (values) => {
    let url = "Login";
    const data = {
      email: values.signInEmail,
      password: values.singInPassword,
    };
    setBtnLoading(true);
    try {
      const res = await fetchHelper(url, data, "POST");
      if (has(res, "authToken") && !isEmpty(res.authToken)) {
        dispatch(setUserData(res.authToken, res));
        router.replace("/people");
      } else {
        if (res.message || res.Message) {
          Notify("error", "Oops!", res.message || res.Message);
        }
      }
      setBtnLoading(false);
    } catch (error) {
      setBtnLoading(false);
      console.log(error);
    }
  };

  const handlePasswordRecover = async (values) => {
    let url = `Login/SendResetPasswordEmail/${values.recoverEmail}`;
    setBtnLoading(true);
    try {
      const res = await fetchHelper(url);
      if (res) {
        Notify(
          "success",
          "Success!",
          "A password reset link sent. Please check your mail."
        );
        onIndexChange(0, false);
      } else {
        Notify("error", "Oops!", "Something went wrong!");
      }
      setBtnLoading(false);
    } catch (error) {
      console.log(error);
      setBtnLoading(false);
    }
    onIndexChange(null);
  };

  const handleRegister = async (values) => {
    const g =
      (has(values, "gender") && values.gender) ||
      (AuthRedux.registerGender === false ? "Females" : "Males");
    //FIX VALUES
    if (values.terms) {
      //If terms and condition accepted only then proceed
      values.agencyId = -1;
      values.translatorId = -1;
      let url = `${g}/Register`;
      const data = {
        agencyId: values.agencyId,
        translatorId: values.translatorId,
        email: values.email,
        name: values.name,
        password: values.password,
      };
      if (
        !isEmpty(matchOptions) &&
        has(matchOptions, "minAge") &&
        has(matchOptions, "maxAge")
      ) {
        data.lowerAgeLimit = Number(matchOptions.minAge);
        data.upperAgeLimit = Number(matchOptions.maxAge);
      }
      setBtnLoading(true);
      try {
        const res = await fetchHelper(url, data, "POST");
        if (!has(res, "ErrorCode") && !isEmpty(res.authToken)) {
          dispatch(setUserData(res.authToken, res));
          dispatch(AuthActions.setRegisterGender(null));
          router.replace("/people");
          onIndexChange(null);
        } else {
          if (res.message || res.Message) {
            Notify("error", "Oops!", res.message || res.Message);
          }
        }
        setBtnLoading(false);
      } catch (error) {
        setBtnLoading(false);

        console.log(error);
      }
    }
  };

  const handleTermsCheckBox = (e) => {
    setTermsChecked(e.target.checked);
  };

  const popOverContent = () => {
    // 0 => Signin Form
    // 1 => Recover Password Form
    // 2 => Register Account Form
    if (popOverIndex === 0) {
      return (
        <Row className="signinForm">
          <Col span={24}>
            <Form
              form={form}
              name="signinForm"
              style={{ borderRadius: 10 }}
              onFinish={handleSignin}
              size="large"
              initialValues={initialValues}
            >
              <Form.Item
                className="signFormItem"
                name="signInEmail"
                rules={[
                  {
                    type: "email",
                    required: true,
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input placeholder="Your Email" />
              </Form.Item>
              <Form.Item
                className="signFormItemPass"
                name="singInPassword"
                rules={[
                  { required: true, message: "Please enter password" },
                  {
                    max: 15,
                    message: "Maximum 15 characters are allowed",
                  },
                ]}
              >
                <Input
                  type="password"
                  placeholder="Password"
                  suffix={
                    <Button
                      type="link"
                      className="recoverPassText"
                      size="small"
                      onClick={() => onIndexChange(1)}
                    >
                      Recover Password
                    </Button>
                  }
                />
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
                  Sign In
                </Button>
              </Form.Item>
            </Form>
            <Divider plain>or</Divider>
            <Row style={{ width: "100%" }}>
              <FbLogin />
            </Row>
            <Row className="policyTextContainer">
              <Text type="secondary" className="termsPolicyText">
                By clicking «Sign in via Facebook» you agree to our{" "}
                <span
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => router.push(`/links/terms`)}
                >
                  Terms
                </span>{" "}
                and{" "}
                <span
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => router.push(`/links/privacy`)}
                >
                  Privacy Policy
                </span>
              </Text>
            </Row>
            <Row align="center" className="signupDiv">
              <Text style={{ color: "#0dacd7" }}>
                {translate("create_account")}
              </Text>
              <Button
                style={{ width: "fit-content", padding: "4px" }}
                className="secondaryColor"
                type="link"
                block
                onClick={() => onIndexChange(2)}
              >
                Sign up
              </Button>
            </Row>
          </Col>
        </Row>
      );
    } else if (popOverIndex === 1) {
      return (
        <Row className="signinForm">
          <Col span={24}>
            <Form
              form={form}
              name="RecoverForm"
              style={{ borderRadius: 10 }}
              onFinish={handlePasswordRecover}
              size="large"
            >
              <Form.Item
                name="recoverEmail"
                className="signFormItem"
                rules={[
                  {
                    type: "email",
                    required: true,
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input placeholder="Your Email" />
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
            <Button
              className="center secondaryColor"
              type="link"
              block
              onClick={() => onIndexChange(0)}
            >
              Sign in
            </Button>
          </Col>
        </Row>
      );
    } else if (popOverIndex === 2) {
      return (
        <Row className="signinForm">
          <Col span={24}>
            <Form
              form={form}
              name="signUpForm"
              style={{ borderRadius: 10 }}
              onFinish={handleRegister}
              size="large"
              initialValues={initialValues}
            >
              <Form.Item
                className="signFormItem"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please enter a name",
                  },
                  {
                    max: 25,
                    message: "Maximum 25 characters are allowed",
                  },
                ]}
              >
                <Input placeholder="Name" />
              </Form.Item>
              {![true, false].includes(AuthRedux.registerGender) && (
                <Form.Item
                  className="signFormItem flex_grow_class"
                  label={<Text strong>I am a</Text>}
                  name="gender"
                  rules={[
                    {
                      required: true,
                      message: "Please select your gender",
                    },
                  ]}
                >
                  <Radio.Group
                    options={[
                      { label: "Male", value: "Males" },
                      { label: "Female", value: "Females" },
                    ]}
                    onChange={(e) => setRegisterGender(e.target.value)}
                    value={registerGender}
                  />
                </Form.Item>
              )}
              <Form.Item
                className="signFormItem"
                name="email"
                rules={[
                  {
                    type: "email",
                    required: true,
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input placeholder="Real Email" />
              </Form.Item>
              <Form.Item
                className="signFormItem"
                name="password"
                rules={[
                  { required: true, message: "Please enter password" },
                  {
                    min: 6,
                    max: 15,
                    message: "Password must be between 6 to 15 characters",
                  },
                ]}
              >
                <Input type="password" placeholder="Password" />
              </Form.Item>
              <Form.Item
                name="terms"
                valuePropName="checked"
                className="checkBoxClickItem"
              >
                <Checkbox onChange={handleTermsCheckBox}>
                  <Text
                    type={termsChecked ? "secondary" : "danger"}
                    className="termsPolicyText"
                  >
                    By clicking «Create Account» you agree to our{" "}
                    <span
                      style={{ textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => router.push(`/links/terms`)}
                    >
                      Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span
                      style={{ textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => router.push(`/links/privacy`)}
                    >
                      Privacy Policy
                    </span>
                  </Text>
                </Checkbox>
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
                  Create Account
                </Button>
              </Form.Item>
            </Form>
            <Row align="center" className="signupDiv">
              <Text style={{ color: "#0dacd7" }}>Have an Account?</Text>
              <Button
                style={{ width: "fit-content", padding: "4px" }}
                className="center secondaryColor"
                type="link"
                block
                onClick={() => onIndexChange(0)}
              >
                Login
              </Button>
            </Row>
          </Col>
        </Row>
      );
    } else {
      return <></>;
    }
  };

  if (props.onlyModal) {
    return (
      <Row className="signModalRow">
        <Modal
          className="class_modal_sign"
          visible={signModal}
          onCancel={() => onIndexChange(null, false)}
          zIndex={10}
          maskClosable={false}
          closable={false}
          footer={null}
          maskStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(6px)",
          }}
        >
          {popOverContent()}
        </Modal>
      </Row>
    );
  }

  return (
    <>
      <Row className="headerRow">
        <Col span={24} className="header_head_col">
          <Col
            className="iconText"
            xs={{ span: 18 }} //mobile
            md={{ span: 12 }} //tablet
            lg={{ span: 16 }} //laptop
            xl={{ span: 12 }} //pc
            onClick={() => router.push("/")}
          >
            <HeartFilled className="heartIcon" />
            {isMobile ? (
              <Title level={3} className="headerTitle">
                TrueBrides
              </Title>
            ) : (
              <Title level={1} className="headerTitle">
                TrueBrides
              </Title>
            )}
          </Col>
          {token ? null : (
            <Col
              className="menuSignInCol"
              xs={{ span: 6 }}
              md={{ span: 10 }}
              lg={{ span: 8 }}
              xl={{ span: 12 }}
            >
              {showIcons ? (
                <Button
                  className="menuIcon iconMenu"
                  onClick={() => onIndexChange(0, true)}
                >
                  SIGN IN
                </Button>
              ) : (
                <>
                  <Text className="haveAnAcoountText">Have an account?</Text>
                  <Button
                    type="ghost"
                    block
                    size="large"
                    className="HeadersignInBtn"
                    onClick={() => onIndexChange(0, true)}
                  >
                    Sign In
                  </Button>
                </>
              )}
              <Row className="signModalRow">
                <Modal
                  className="class_modal_sign"
                  visible={signModal}
                  onCancel={() => onIndexChange(null, false)}
                  zIndex={10}
                  footer={null}
                  maskStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.45)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {popOverContent()}
                </Modal>
              </Row>
            </Col>
          )}
        </Col>
      </Row>
    </>
  );
}

Header.defaultProps = {
  onlyModal: false,
  pIndex: null,
  onIndexChange: () => {},
};

Header.propTypes = {
  onlyModal: PropTypes.bool,
  pIndex: PropTypes.number,
  onIndexChange: PropTypes.func,
};

export default Header;
