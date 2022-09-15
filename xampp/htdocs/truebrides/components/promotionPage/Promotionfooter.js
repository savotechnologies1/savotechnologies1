/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Row, Col, Typography, Button } from "antd";
import { useRouter } from "next/router";
import Images from "@config/images";
import { footerData, footerFollowData } from "@config/staticData";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { FAQmodal } from "@components";
import ContactUsForm from "@components/ContactUsForm";
import "./Promotionfooter.module.less";

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
      <Row className="footerMainRow" >
       
        <Col
          xs={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 24 }}
          xl={{ span: 24 }}
          className=""
        >
          <Row className="footerRowClass" >
            <ul className="btnSpanFlex">
             
              {footerData.map((item, key) => {
                return (
                  <li
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
                  </li>
                );
              })}
            </ul>
           
          </Row>
        </Col>
      </Row>
      <Row justify="space-between" align="middle" className="footerRowClass">
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
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
