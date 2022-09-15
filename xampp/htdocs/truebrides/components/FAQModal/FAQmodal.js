/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Typography, Modal, Collapse } from "antd";
import { WhatsAppOutlined, MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import fetchHelper from "@redux/utils/apiHelper";
import { isEmpty } from "lodash";
import ContactUsForm from "@components/ContactUsForm";
import "./FAQmodal.module.less";

const { Text } = Typography;
const { Panel } = Collapse;

function FAQmodal(props) {
  const { visible, dismiss } = props;
  const [res, setRes] = useState({});
  const [contactModal, setContactModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    faqData();
  }, []);

  const faqData = async () => {
    let url = `StaticPages/faq`;
    try {
      const res = await fetchHelper(url, {}, "GET");
      setRes(res);
    } catch (error) {
      console.log("ereeeeeerrrooorrr", error);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const [tabArray, setTabArray] = useState([
    {
      id: 1,
      count: 1,
      title: " General Information",
    },
  ]);

  const [defaultTab, setDefaultTab] = useState({
    id: 1,
    title: "General Information",
  });

  const displayUseServices = () => {
    return (
      <Row>
        <Text className="privacy_pages_title">General Information</Text>
        <Col className="privacy_modal_col">
          {res.map((v) => {
            return (
              <>
                <Collapse accordion={true} className="collapseClass">
                  <Panel header={v.title} key="1">
                    <p>{v.content}</p>
                  </Panel>
                </Collapse>
              </>
            );
          })}
        </Col>
      </Row>
    );
  };
  const privacy = () => {
    return (
      <Row>
        <Text className="privacy_pages_title">Title 2</Text>
        <Col className="privacy_modal_col">
          {res.map((v) => {
            return (
              <>
                <Collapse accordion className="collapseClass">
                  <Panel header={v.title} key="2">
                    <p>{v.content}</p>
                  </Panel>
                </Collapse>
              </>
            );
          })}
        </Col>
      </Row>
    );
  };

  const contentServices = () => {
    return (
      <Row>
        <Text className="privacy_pages_title">Title 3</Text>
        <Col className="privacy_modal_col">
          {res.map((v) => {
            return (
              <>
                <Collapse accordion className="collapseClass">
                  <Panel header={v.title} key="3">
                    <p>{v.content}</p>
                  </Panel>
                </Collapse>
              </>
            );
          })}
        </Col>
      </Row>
    );
  };

  const useServices = () => {
    return (
      <Row>
        <Text className="privacy_pages_title">Title 4</Text>
        <Col className="privacy_modal_col">
          {res.map((v) => {
            return (
              <>
                <Collapse accordion className="collapseClass">
                  <Panel header={v.title} key="4">
                    <p>{v.content}</p>
                  </Panel>
                </Collapse>
              </>
            );
          })}
        </Col>
      </Row>
    );
  };

  return (
    <>
      {res && res && !isEmpty(res) && (
        <Modal
          visible={visible}
          footer={null}
          zIndex={10}
          closable={true}
          onCancel={() => dismiss()}
          maskStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(6px)",
          }}
          className="privacymodal_class"
        >
          <Row justify="center" className="helpcenter_title_row">
            <Text className="privacy_pages_title">Help center</Text>
          </Row>
          <Row className="privacy_row_class">
            <Col
              xs={{ span: 24 }}
              sm={{ span: 6 }}
              md={{ span: 6 }}
              lg={{ span: 6 }}
              xl={{ span: 6 }}
              className="privacy_colleft_class"
            >
              {tabArray.map((item, key) => {
                return (
                  <Row
                    key={key}
                    className="title_row"
                    style={{
                      backgroundColor:
                        item.id === defaultTab.id
                          ? "rgba(213, 35, 47, 85%)"
                          : null,
                    }}
                    onClick={() => {
                      setDefaultTab(item);
                    }}
                  >
                    <Col className="title_col_left">
                      <Text
                        className="privacy_title_text"
                        style={{
                          color: item.id === defaultTab.id ? "#fff" : "#222",
                        }}
                      >
                        {item.count}.{item.title}
                      </Text>
                    </Col>
                  </Row>
                );
              })}
            </Col>
            <Col
              xs={{ span: 24, offset: 0 }}
              sm={{ span: 17, offset: 1 }}
              md={{ span: 17, offset: 1 }}
              lg={{ span: 17, offset: 1 }}
              xl={{ span: 17, offset: 1 }}
              className="title_col_right"
            >
              {defaultTab.id === 1
                ? displayUseServices(res)
                : defaultTab.id === 2
                ? privacy(res)
                : defaultTab.id === 3
                ? contentServices(res)
                : useServices(res)}
            </Col>
          </Row>
          <Row justify="center" className="faqFooterRow">
            <Text type="secondary" className="stillQue">
              You still have a question?
            </Text>
            <Text type="secondary" className="faqTxt">
              If you can not find a question in our FAQ, you can always contact
              us. We will answer to you shortly!
            </Text>
          </Row>
          <Row justify="space-between" className="faqIconsRow">
            <div
              className="iconsDiv"
              onClick={() =>
                router.replace(
                  "https://api.whatsapp.com/send?phone=xxxxxxxxxx&text=Send20%a20%quote"
                )
              }
            >
              <WhatsAppOutlined style={{ color: "#25D366", fontSize: 25 }} />
              <Text type="secondary" className="faqTxt">
                +xxxxxxxxxx
              </Text>
              <Text type="secondary" className="faqTxt">
                We are always happy to help!
              </Text>
            </div>
            <div className="iconsDiv">
              <MailOutlined style={{ color: "#d5232f", fontSize: 25 }} />
              <Text
                type="secondary"
                className="faqTxt"
                style={{ cursor: "pointer" }}
                onClick={() => setContactModal(true)}
              >
                Contact Us
              </Text>
              <Text type="secondary" className="faqTxt">
                Best way to get answer faster!
              </Text>
            </div>
          </Row>
        </Modal>
      )}
      <ContactUsForm
        visible={contactModal}
        closable={true}
        dismiss={() => setContactModal(false)}
      />
    </>
  );
}
FAQmodal.defaultProps = {
  visible: false,
  dismiss: () => {},
};

FAQmodal.propTypes = {
  visible: PropTypes.bool,
  dismiss: PropTypes.func,
};

export default FAQmodal;
