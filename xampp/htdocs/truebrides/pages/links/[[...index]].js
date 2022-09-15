import React, { useState, useRef, useEffect } from "react";
import { Col, Row, Typography, Space } from "antd";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { has } from "lodash";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { NewFooter, Header } from "@components";

import {
  termsOfUserIntroText,
  termsOfUsePoints,
} from "@components/StaticPageModal/termsOfUse";
import {
  privacyIntroText,
  privacyPoints,
} from "@components/StaticPageModal/privacyPolicy";
import {
  refundIntroText,
  refundPoints,
} from "@components/StaticPageModal/refundPolicy";
import {
  antiScamIntroText,
  antiScamPoints,
} from "@components/StaticPageModal/antiScamPolicy";
import "../../components/StaticPageModal/styles.module.less";

const { Text, Title } = Typography;

const Data = { 

  "/links/terms": {
    title: "Terms of Use",
    intro: termsOfUserIntroText,
    points: termsOfUsePoints,
  },
  
  "/links/about": {
    title: "About",
    intro: termsOfUserIntroText,
    points: termsOfUsePoints,
  },
  "/links/privacy": {
    title: "Privacy Policy",
    intro: privacyIntroText,
    points: privacyPoints,
  },
  "/links/refund": {
    title: "Refund Policy",
    intro: refundIntroText,
    points: refundPoints,
  },
  "/links/antiscam": {
    title: "Anti-Scam Policy",
    intro: antiScamIntroText,
    points: antiScamPoints,
  },
};

function Links() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [popOverIndex, setPopOverIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(null);
  const currentBP = useCurrentScreen();
  const isMobile = ["xs"].includes(currentBP);

  const [scrollableContentHeight, setScrollableContentHeight] = useState(0);
  const introParaRef = useRef(null);

  //For Inside Scroll
  useEffect(() => {
    if (scrollableContentHeight === 0) {
      if (
        introParaRef &&
        introParaRef.current &&
        introParaRef.current.offsetHeight
      ) {
        setScrollableContentHeight(introParaRef.current.offsetHeight);
      }
    }
  }, [introParaRef]);
  //For Inside Scroll

  const handleScroll = (e, i) => {
    e.preventDefault();
    const element = document.getElementById(i.toString());
    element && element.scrollIntoView();
  };

  const renderLeftColumn = () => {
    return (
      <Space direction="vertical" style={{ width: "100%", marginBottom: 20 }}>
        {Data[router.asPath] &&
          Data[router.asPath]["points"].map((v, i) => {
            return (
              <Row key={i}>
                <Title level={5} className="leftTitles">
                  <a onClick={(e) => handleScroll(e, i)}>{`${i + 1}. ${
                    v.title
                  }`}</a>
                </Title>
              </Row>
            );
          })}
      </Space>
    );
  };

  const renderRightColumn = () => {
    return (
      <Space direction="vertical" style={{ width: "100%" }} size={40}>
        {Data[router.asPath] && has(Data[router.asPath], "intro") && (
          <Col span={24} style={{ marginBottom: 20, textAlign: "justify" }}>
            <Text>
              <div
                dangerouslySetInnerHTML={{
                  __html: Data[router.asPath]["intro"],
                }}
              ></div>
            </Text>
          </Col>
        )}
        {Data[router.asPath] &&
          has(Data[router.asPath], "points") &&
          Data[router.asPath]["points"].map((v, i) => {
            return (
              <div key={i.toString()} style={{ marginBottom: 16 }}>
                <Row id={i.toString()}>
                  <Title level={3} className="rightSubTitles">{`${i + 1}. ${
                    v.title
                  }`}</Title>
                </Row>
                <Row>
                  <Text className="rightTitle">
                    <div dangerouslySetInnerHTML={{ __html: v.text }}></div>
                  </Text>
                </Row>
              </div>
            );
          })}
      </Space>
    );
  };

  return (
    <>
      <Row
        style={{
          backgroundColor: "white",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Col
          xs={{ offset: 0, span: 24 }} //mobile
          md={{ offset: 1, span: 22 }} //tablet
          lg={{ offset: 2, span: 20 }} //laptop
          xl={{ offset: 4, span: 16 }} //pc > 1440px
          className="iconCol"
        >
          <Header
            token={token}
            pIndex={popOverIndex}
            onIndexChange={(i) => {
              setPopOverIndex(i);
            }}
          />
        </Col>
      </Row>
      <Row justify="center" align="top">
        <Title className="linksTitle">{Data[router.asPath]?.title}</Title>
      </Row>
      <Row
        justify="center"
        align="top"
        style={{ marginTop: 10, width: "100%" }}
      >
        {!isMobile && (
          <Col xs={24} sm={12} md={9} lg={8} xl={6} className="rightColClass">
            {renderLeftColumn()}
          </Col>
        )}
        <Col
          xs={24}
          sm={12}
          md={13}
          lg={12}
          xl={10}
          style={{ paddingLeft: 10 }}
        >
          <div
            className="contentArea"
            style={{
              //For Inside Scroll
              height: `calc(100vh - (${
                isMobile ? "100px" : "140px"
              } + ${scrollableContentHeight}px))`,
            }}
          >
            {isMobile && renderLeftColumn()}
            {renderRightColumn()}
          </div>
        </Col>
      </Row>
      <Row className="linksFooterRow">
        <Col
          xs={{ offset: 0, span: 24 }}
          md={{ offset: 1, span: 22 }}
          lg={{ offset: 2, span: 20 }}
          xl={{ offset: 4, span: 16 }}
        >
          <NewFooter modalOpen={modalOpen} setModalOpen={setModalOpen} />
        </Col>
      </Row>
    </>
  );
}

export default Links;
