import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Col, Row, Typography, Space } from "antd";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { has } from "lodash";
import { termsOfUserIntroText, termsOfUsePoints } from "./termsOfUse";
import { privacyIntroText, privacyPoints } from "./privacyPolicy";
import { refundIntroText, refundPoints } from "./refundPolicy";
import "./styles.module.less";
import { antiScamIntroText, antiScamPoints } from "./antiScamPolicy";

const { Text, Title } = Typography;

const Data = {
  terms: {
    title: "Terms of Use",
    intro: termsOfUserIntroText,
    points: termsOfUsePoints,
  },
  about: {
    title: "About",
    intro: termsOfUserIntroText,
    points: termsOfUsePoints,
  },
  privacy: {
    title: "Privacy Policy",
    intro: privacyIntroText,
    points: privacyPoints,
  },
  refund: {
    title: "Refund Policy",
    intro: refundIntroText,
    points: refundPoints,
  },
  antiscam: {
    title: "Anti-Scam Policy",
    intro: antiScamIntroText,
    points: antiScamPoints,
  },
};

function StaticPageModal(props) {
  const { visible, dismiss, type } = props;
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

  const closeModal = () => {
    dismiss();
  };

  const handleScroll = (e, i) => {
    e.preventDefault();
    const element = document.getElementById(i.toString());
    element && element.scrollIntoView();
  };

  const renderLeftColumn = () => {
    return (
      <Space direction="vertical" style={{ width: "100%", marginBottom: 20 }}>
        {Data[type] &&
          Data[type]["points"].map((v, i) => {
            return (
              <Row key={i}>
                <Title level={5}>
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
        {Data[type] && has(Data[type], "intro") && (
          <Col span={24} style={{ marginBottom: 20, textAlign: "justify" }}>
            <Text>
              <div
                dangerouslySetInnerHTML={{ __html: Data[type]["intro"] }}
              ></div>
            </Text>
          </Col>
        )}
        {Data[type] &&
          has(Data[type], "points") &&
          Data[type]["points"].map((v, i) => {
            return (
              <div key={i.toString()} style={{ marginBottom: 16 }}>
                <Row id={i.toString()}>
                  <Title level={3}>{`${i + 1}. ${v.title}`}</Title>
                </Row>
                <Row>
                  <Text>
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
    <Modal
      className="staticModal"
      visible={visible}
      zIndex={10}
      closable={true}
      onCancel={() => closeModal()}
      footer={null}
      style={{ top: 0 }}
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
      }}
    >
      <>
        <Row justify="center" align="top">
          <Title>{Data[type]?.title}</Title>
        </Row>
        <Row justify="center" align="top">
          {!isMobile && (
            <Col xs={24} sm={6}>
              {renderLeftColumn()}
            </Col>
          )}
          <Col xs={24} sm={18} style={{ paddingLeft: 22 }}>
            <div
              className="contentArea"
              style={{
                //For Inside Scroll
                height: `calc(100vh - (140px + ${scrollableContentHeight}px))`,
              }}
            >
              {isMobile && renderLeftColumn()}
              {renderRightColumn()}
            </div>
          </Col>
        </Row>
      </>
    </Modal>
  );
}

StaticPageModal.defaultProps = {
  visible: false,
  dismiss: () => {},
  type: "terms",
};

StaticPageModal.propTypes = {
  visible: PropTypes.bool,
  dismiss: PropTypes.func,
  type: PropTypes.string.isRequired,
};

export default StaticPageModal;
