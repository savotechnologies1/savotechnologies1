import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col, Typography } from "antd";
import {
  TopSection,
  NewFeatured,
  VideoPlay,
  SignupFooter,
  SingleBlog,
  Promotionfooter,
  Promotion,
  Header,
} from "@components";
import { isEmpty, isNull } from "lodash-es";
import useWindowDimensions from "@config/dimensions";
import AuthActions from "@redux/reducers/auth/actions";
import { CloseCircleOutlined } from "@ant-design/icons";
import { getCookie, setCookie } from "@redux/utils/commonFunctions";
import "@pageStyles/landingPage.module.less";
import ReactGA from "react-ga4";

const { Text } = Typography;

function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { windowWidth } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [popOverIndex, setPopOverIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(null);
  const [closeDiv, setCloseDiv] = useState("");

  useEffect(() => {
    if (!isEmpty(token)) {
      router.replace("/people");
    }
  }, [token]);

  useEffect(() => {
    setWidth(windowWidth);
  }, [windowWidth]);

    useEffect(() => {
	  ReactGA.initialize("G-KLMELWNLS2");
	  ReactGA.send("pageview");
  }, []);

  useEffect(() => {
    if (isNull(popOverIndex)) {
      dispatch(AuthActions.setRegisterGender(null));
    }
  }, [popOverIndex]);

  useEffect(() => {
    var uCookies = getCookie("user_cookies");
    setCloseDiv(uCookies);
  }, []);

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
        {
          <>
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
          
            <Row className="memberRowMain">
              <Col
                lg={{ offset: 0, span: 24 }}
              >
                <Promotion />
              </Col>
            </Row>
            
            <Row className="newfooterRow">
              <Col
                xs={{ offset: 0, span: 24 }}
                md={{ offset: 1, span: 22 }}
                lg={{ offset: 2, span: 20 }}
                xl={{ offset: 4, span: 16 }}
              >
                <Promotionfooter
                  modalOpen={modalOpen}
                  setModalOpen={setModalOpen}
                  cookieFalse={closeDiv === null}
                />
              </Col>
            </Row>
            {closeDiv === "1" ? null : (
              <Row className="cookiesRow">
                <Text style={{ textAlign: "center" }}>
                  We use cookies to provide you better experience with our
                  website. By continuing using it, including by remaining on the
                  landing page, you consent to the use of cookies. To find more
                  information, including how to disable cookies, please take a
                  look at our{" "}
                  <span
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => router.push(`/links/privacy`)}
                  >
                    Privacy Policy
                  </span>
                </Text>
                <CloseCircleOutlined
                  style={{ fontSize: 18, marginLeft: 10 }}
                  onClick={() => {
                    setCookie("user_cookies", "1", 30);
                    var uCookies = getCookie("user_cookies");
                    setCloseDiv(uCookies);
                  }}
                />
              </Row>
            )}
          </>
        }
      </div>
    </>
  );
}

export default Home;
