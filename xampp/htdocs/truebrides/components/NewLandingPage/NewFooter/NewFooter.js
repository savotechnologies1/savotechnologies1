/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Row, Col, Typography, Button } from "antd";
import { useRouter } from "next/router";
import Images from "@config/images";
import { footerData, footerFollowData } from "@config/staticData";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { FAQmodal } from "@components";
import ContactUsForm from "@components/ContactUsForm";
import "./NewFooter.module.less";

const { Text, Title } = Typography;

export default function Footer({ setModalOpen, cookieFalse }) {
  const router = useRouter();
  const currentBP = useCurrentScreen();
  const isTab = ["md"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);
  const [contactModal, setContactModal] = useState(false);
  const [faqModal, setFAQModal] = useState(false);

  return (
    <>
      <Row className="footerMainRow" justify="center">
        <Col
          xs={{ span: 24 }}
          md={{ span: 10 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          className="footerCol1"
        >
          <Title level={2} className="footerText">
            Looking for help?
          </Title>
          {isTab || isMobile ? (
            <Text className="dreamtextFooter">
              If you need any assistance, reach out to us by clicking the form
              below. Our dedicated support team will get in touch with you
              shortly.
            </Text>
          ) : (
            <Text className="dreamtextFooter">
              If you need any assistance, reach out to us by clicking the form
              below.
              <br /> Our dedicated support team will get in touch with you
              shortly.
            </Text>
          )}
          <Button
            type="ghost"
            size="large"
            className="footerContactBtn"
            onClick={() => setContactModal(true)}
          >
            CONTACT US
          </Button>
        </Col>
        <Col
          xs={{ span: 24 }}
          md={{ span: 14 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          className="colLinkClass"
        >
          <Row className="rowFooterSpaveBtween" justify="space-between">
            <span className="btnSpanFlex">
              <Title level={5} className="titleLink">
                LINKS
              </Title>
              {footerData.map((item, key) => {
                return (
                  <Button
                    key={key}
                    type="link"
                    size="small"
                    className="btnlink"
                  >
                    <span
                      className="linkUnderLineHover"
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.type === "help") {
                          setFAQModal(true);
                        } else {
                          setModalOpen(item.type);
                          router.push(`/links/${item.type}`);
                        }
                      }}
                    >
                      {item.text}
                    </span>
                  </Button>
                );
              })}
            </span>
            <span>
              <Title level={5} className="titleLink">
                Follow us on:
              </Title>
              {footerFollowData.map((item, key) => {
                return (
                  <Row key={key}>
                    <Button
                      type="link"
                      size="small"
                      icon={item.icon}
                      className="btnlink"
                      onClick={() => window.open(item.url)}
                    >
                      <span className="linkUnderLineHover marginLeft">
                        {item.text}
                      </span>
                    </Button>
                  </Row>
                );
              })}
            </span>
          </Row>
        </Col>
      </Row>
      <Row justify="space-between" align="middle" className="footerRowClass">
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 13 }}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Text type="secondary" className="footerAddClass">
            True Networks LTD, 71-75 Shelton Street, Covent Garden, London, WC2H
            9JQ
          </Text>
          <Text type="secondary" className="footerAddClass">
            Copyright © 2021 TrueBrides. All rights reserved.
          </Text>
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 11 }}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <img
            src={Images.mastercard}
            style={{ marginRight: 10 }}
            className="footerCardClass"
          />
          <img src={Images.visaCard} className="footerCardClass" />
        </Col>
      </Row>
      <FAQmodal visible={faqModal} dismiss={() => setFAQModal(false)} />
      <ContactUsForm
        visible={contactModal}
        closable={true}
        dismiss={() => setContactModal(false)}
      />
    </>
  );
}
