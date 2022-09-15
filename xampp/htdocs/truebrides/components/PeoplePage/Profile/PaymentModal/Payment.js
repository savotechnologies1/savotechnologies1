/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import React, { useEffect, useState } from "react";
import { Button, Col, Input, Modal, Row, Select, Spin, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { monthnumber, yearNumber } from "@config/staticData";
import fetchHelper from "@redux/utils/apiHelper";
import { useSelector } from "react-redux";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { Notify, StaticPageModal } from "@components";
import { getMyProfileData } from "@redux/utils/commonFunctions";
import Images from "@config/images";
import ContactUsForm from "@components/ContactUsForm";
import "./Payment.module.less";

const { Text, Title } = Typography;
const { Option } = Select;

function Payment(props) {
  const { dismiss, visible } = props;
  const { token } = useSelector((state) => state.auth);
  // eslint-disable-next-line no-unused-vars
  const [payFlag, setPayFlag] = useState(false);
  const [termsModal, setTermsModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const currentBP = useCurrentScreen();
  const isMobile = ["xs"].includes(currentBP);
  const [priceList, setPriceList] = useState([]);
  const [selected, setSelected] = useState({
    name: "Starter",
    price: 29.99,
    credit: 100,
    id: -1,
  });
  const [listLoad, setListLoad] = useState(false);

  async function getCreditPriceList() {
    setListLoad(true);
    let url = `App/Settings`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (res) {
        setPriceList(res.creditPriceList);
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
      setListLoad(false);
    } catch (error) {
      setListLoad(false);
      console.log(error);
    }
  }

  useEffect(() => {
    getCreditPriceList();
  }, []);

  const handlePlans = async () => {
    let url = `payments/purchase?creditPriceId=${selected.id}`;
    try {
      const res = await fetchHelper(url, {}, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (res) {
        window.location.href = res;
        dismiss();
        getMyProfileData();
        // Notify("success", "Success!", "Credits added successfully");
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
      dismiss();
    } catch (error) {
      Notify("error", "Oops!", "Something went wrong");
      dismiss();
    }
  };

  return (
    <>
      <Modal
        className="pricingModal"
        visible={visible}
        footer={null}
        zIndex={10}
        onCancel={() => dismiss()}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        {!payFlag ? (
          <>
            <Title level={3} className="paymentTitle">
              Buy credits to fully discover all features and find your match
              today!
            </Title>
            <div style={{ textAlign: "center", fontSize: 12 }}>
              <Text type="secondary">
                Service price: Read email <span>FREE, </span>Send Email 10
                credits, Live chat 1 credit per minute, Send/Unlock photo 10
                credits per attachment.{" "}
                <span
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => setTermsModal(true)}
                >
                  More info
                </span>
              </Text>
            </div>
            <Spin spinning={listLoad}>
              <Row className="payContainer">
                {priceList.map((item) => {
                  return (
                    <Col xs={24} sm={8} md={8} className="column chover">
                      <div
                        className="cardStyle"
                        style={{
                          border:
                            item.name === selected.name
                              ? "2px solid green"
                              : "0.5px solid #ccc",
                        }}
                        onClick={() =>
                          setSelected({
                            ...selected,
                            name: item.name,
                            price: item.price,
                            credit: item.credit,
                            id: item.id,
                          })
                        }
                      >
                        {isMobile ? (
                          <Row
                            style={{ padding: "5px 20px 5px 15px" }}
                            align="middle"
                            justify="space-between"
                          >
                            <Col
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <CheckCircleOutlined
                                style={{
                                  color:
                                    item.name === selected.name
                                      ? "green"
                                      : null,
                                  fontSize: 20,
                                }}
                              />
                              <Col style={{ marginLeft: 12 }}>
                                <Title
                                  style={{ fontSize: 16, marginBottom: 0 }}
                                >
                                  {item.name}
                                </Title>
                                <Text style={{ fontSize: 13 }}>
                                  {item.credit} Credits
                                </Text>
                              </Col>
                            </Col>
                            <Col style={{ textAlign: "right" }}>
                              <Title style={{ fontSize: 16, marginBottom: 0 }}>
                                {item.price}$
                              </Title>
                              <Text
                                type="secondary"
                                style={{ fontSize: 14, marginBottom: 0 }}
                              >
                                {item.credit === 100
                                  ? 30
                                  : item.credit === 500
                                  ? 20
                                  : item.credit === 1500
                                  ? 13
                                  : null}{" "}
                                cent per credit
                              </Text>
                            </Col>
                          </Row>
                        ) : (
                          <>
                            <div className="tickTitleDiv">
                              <Text type="secondary">{item.name}</Text>
                              {item.name === selected.name && (
                                <CheckCircleOutlined
                                  style={{ color: "green" }}
                                />
                              )}
                            </div>
                            <div style={{ margin: "10px 0px 20px 10px" }}>
                              <Title level={2} className="priceTag">
                                {item.price}$
                              </Title>
                              <Text>{item.credit} Credits</Text>
                            </div>
                            <div style={{ margin: "10px 10px 20px 10px" }}>
                              <Text
                                type="secondary"
                                style={{ fontSize: 14, marginBottom: 0 }}
                              >
                                {item.credit === 100
                                  ? 30
                                  : item.credit === 500
                                  ? 20
                                  : item.credit === 1500
                                  ? 13
                                  : null}{" "}
                                cent per credit
                              </Text>
                            </div>
                          </>
                        )}
                      </div>
                    </Col>
                  );
                })}
              </Row>
              <Row justify="center" style={{ marginTop: 20, marginBottom: 20 }}>
                <img src={Images.visaCard} className="paymentCards" />
                <img src={Images.mastercard} className="paymentCards" />
                <img src={Images.discover} className="paymentCards" />
                <img src={Images.dinersClub} className="paymentCards" />
                <img src={Images.jcb} className="paymentCards" />
              </Row>
              <Row justify="center">
                <Col xs={22} sm={22} md={11} lg={10}>
                  <Button
                    size="large"
                    className="buynow"
                    onClick={() => handlePlans(selected.credit)}
                  >
                    BUY CREDITS
                  </Button>
                </Col>
              </Row>
              <Row justify="center">
                <Text type="secondary" className="mobileFont">
                  {`You have selected ${selected.credit} Credits for ${selected.price}$ in total.`}
                </Text>
              </Row>
              <Row
                justify="center"
                style={{
                  textAlign: "center",
                  marginTop: 15,
                  marginBottom: isMobile ? 20 : 40,
                }}
              >
                <Text type="secondary" className="mobileFont">
                  Paid Features can be used only by spending our virtual
                  currency called "Credits".
                  <br /> All transactions are handled securely and discretely by
                  our authorised merchant Verotel.
                  <br /> For billing Inquiries please visit{" "}
                  <span
                    className="verotelLink"
                    onClick={() => window.open('https://www.vtsup.com/')}
                  >
                    Verotel
                  </span>{" "}
				         end user support web-site.
                </Text>
              </Row>
              <Row justify="center" style={{ textAlign: "center" }}>
                <Text type="secondary" className="mobileFont">
                  If you have problems please contact our{" "}
                  <span
                    className="verotelLink"
                    onClick={() => setContactModal(true)}
                  >
                    Support
                  </span>{" "}
                  team or simply send email to{" "}
                  <span className="verotelLink">support@truebrides.com</span>
                </Text>
              </Row>
            </Spin>
          </>
        ) : (
          <>
            <Row>
              <Col className="headerTextCol">
                <Text className="headerText">
                  Subscribe to start advanced communication!
                </Text>
                <Text type="secondary" className="credit_text_class">
                  Communication with Popular Members costs: Live Chat — 1 Credit
                  per minute, Offline message — 1 Credit, Email — 10 Credits
                </Text>
              </Col>
            </Row>
            <Row justify="center">
              <Col className="headerTextCol">
                <Button className="greenBtn" type="primary">
                  USE CARD FROM BROWSER
                </Button>
                <Text className="pay_here_text">or pay here</Text>
              </Col>
            </Row>
            <Row justify="center">
              <Col className="headerTextCol">
                <Input
                  placeholder="Card number"
                  className="input_class_number"
                />
                <span className="input_class_number">
                  <Select placeholder="MM">
                    {monthnumber.map((v) => {
                      return (
                        <Option value={v} key={v.toString()}>
                          {v.toString()}
                        </Option>
                      );
                    })}
                  </Select>
                  <span className="slash_class">/</span>
                  <Select placeholder="YY">
                    {yearNumber.map((v) => {
                      return (
                        <Option value={v} key={v.toString()}>
                          {v.toString()}
                        </Option>
                      );
                    })}
                  </Select>
                  <span>
                    <Text className="cvv_class">CVV</Text>
                    <Input style={{ width: "50px" }} />
                  </span>
                </span>
                <Input
                  placeholder="Name on card"
                  className="input_class_number"
                />
                <Input
                  placeholder="Mobile phone"
                  className="input_class_number"
                />
                <Button type="primary" className="subscribe_class">
                  SUBSCRIBE
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Modal>
      <StaticPageModal
        visible={termsModal}
        dismiss={() => setTermsModal(false)}
        type="terms"
      />
      <ContactUsForm
        visible={contactModal}
        closable={true}
        dismiss={() => setContactModal(false)}
      />
    </>
  );
}
Payment.defaultProps = {
  dismiss: () => {},
  visible: false,
};

Payment.propTypes = {
  dismiss: PropTypes.func,
  visible: PropTypes.bool,
};

export default Payment;
