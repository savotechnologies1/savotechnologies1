/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col, Typography, Button, Spin } from "antd";
import { Notify, Header } from "@components";
import { has, isEmpty } from "lodash-es";
import { ExclamationCircleTwoTone } from "@ant-design/icons";
import useWindowDimensions from "@config/dimensions";
import fetchHelper from "@redux/utils/apiHelper";
import AuthActions from "@redux/reducers/auth/actions";
import "@pageStyles/landingPage.module.less";
import "./confirmEmail.module.less";
import Images from "@config/images";

const { Title, Text } = Typography;
const { setUserData } = AuthActions;

function confirmEmail() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth);
  const { windowWidth } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [btnLoading, setBtnLoading] = useState(false);
  const [popOverIndex, setPopOverIndex] = useState(null);
  const [verifyLoader, setVerifyLoader] = useState(true);
  const [status, setStatus] = useState(false); //Success state for email confirm on api call
  //Register Form Values
  useEffect(() => {
    if (has(router.query, "userId") && has(router.query, "confirmationToken")) {
      verifyMail();
    }
  }, []);

  useEffect(() => {
    if (has(userData, "emailConfirmed") && userData.emailConfirmed) {
      router.replace("/people");
    }
  }, [userData]);

  const verifyMail = async () => {
    let url = "Login";
    const data = {
      userId: router.query?.userId,
      confirmationToken: encodeURIComponent(router.query?.confirmationToken),
    };
    setVerifyLoader(true);
    try {
      const res = await fetchHelper(url, data, "PUT");
      if (res.successful && res.emailConfirmed) {
        dispatch(
          setUserData(res.authToken, {
            ...userData,
            emailConfirmed: true,
          })
        );
        router.replace("/people");
        setVerifyLoader(false);
        setStatus(true); // success
      } else {
        if (res.message || res.Message) {
          Notify("error", "Oops!", res.message || res.Message);
        }
        setVerifyLoader(false);
        setStatus(false); // Failed to verify
      }
    } catch (error) {
      setStatus(false); // Failed to verify
      console.log(error);
    }
  };

  const handleResendEmail = async () => {
    const email = userData.email;
    if (isEmpty(email)) {
      return;
    }
    let url = `Login/Resend/${email}`;
    setBtnLoading(true);
    try {
      const res = await fetchHelper(url, {}, "GET");
      if (res) {
        Notify("success", "Success!", "A verfication email sent.");
      }
      setBtnLoading(false);
    } catch (error) {
      Notify("error", "Oops!", "Something went wrong!");
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    setWidth(windowWidth);
  }, [windowWidth]);

  const renderBody = () => {
    if (has(router.query, "userId") && has(router.query, "confirmationToken")) {
      return (
        <div className="mainBody">
          <Row className="" justify="center">
            <Col
              xs={22}
              sm={22}
              md={12}
              lg={8}
              className="verificationContainer"
            >
              {verifyLoader ? (
                <>
                  <Row justify="center" align="middle">
                    <Spin spinning className="spinner" size="default" />
                  </Row>
                  <Row justify="center" align="middle">
                    <Title level={3} className="noticeTitle">
                      Verifying your email
                    </Title>
                  </Row>
                </>
              ) : status ? (
                <>
                  <Row justify="center" align="middle">
                    <img
                      src={Images.verifiedSVG}
                      className="confirmEmailLogo"
                    />
                  </Row>
                  <Row justify="center" align="middle">
                    <Title level={3} className="noticeTitle">
                      Your Email is Successfully verified!
                    </Title>
                  </Row>
                </>
              ) : (
                <>
                  <Row justify="center" align="middle">
                    <ExclamationCircleTwoTone
                      className="errorLogo"
                      twoToneColor=" #d5232f"
                    />
                  </Row>
                  <Row justify="center" align="middle">
                    <Title level={3} className="noticeTitle">
                      Something went wrong!
                    </Title>
                  </Row>
                  <Row justify="center" align="middle">
                    <Text className="noticeText">
                      We were not able to verify your email.
                    </Text>
                  </Row>
                </>
              )}
            </Col>
          </Row>
        </div>
      );
    }
    return (
      <div className="mainBody">
        <Row className="" justify="center">
          <Col xs={22} sm={22} md={12} lg={8} className="verificationContainer">
            <Row justify="center" align="middle">
              <img
                src={Images.emailConfirmation}
                className="confirmEmailLogo"
              />
            </Row>
            <Row justify="center" align="middle">
              <Title level={3} className="noticeTitle">
                Please verify your email
              </Title>
            </Row>
            <Row justify="center" align="middle">
              <Text className="noticeText">
                You're almost there! We have send an email.
              </Text>
            </Row>
            <Row justify="center" align="middle">
              <Text className="noticeText">
                Just click on the link in that email to complete your signup. If
                you don't see it you may need to
                <strong> check your spam </strong> folder.
              </Text>
            </Row>
            <Row justify="center" align="middle">
              <Text className="noticeText">Still can't find the email?</Text>
            </Row>
            <Row justify="center" align="middle">
              <Button
                disabled={btnLoading}
                loading={btnLoading}
                type="primary"
                size="middle"
                className="resendBtn"
                onClick={() => handleResendEmail()}
              >
                Resend Email
              </Button>
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

export default confirmEmail;
