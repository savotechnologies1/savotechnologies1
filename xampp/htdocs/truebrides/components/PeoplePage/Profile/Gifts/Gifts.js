/* eslint-disable react/prop-types */
import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Row, Col, Button, Popover } from "antd";
import {
  MailOutlined,
  GiftOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import "./Gifts.module.less";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { ChatContext } from "@components";
import { getConversationId } from "@redux/utils/commonFunctions";

function Gifts(props) {
  const { verified, onContactExchange, onDateRequest, onSendGift, userId } =
    props;
  const { userData } = useSelector((state) => state.auth);
  const currentBP = useCurrentScreen();
  const [popVisible, setPopVisible] = useState(false);
  const isMobile = ["xs"].includes(currentBP);
  const cc = useContext(ChatContext);

  const AmIFemale = userData?.userType === "Female";

  const chatOrEmail = (e, type = "mail") => {
    e.preventDefault();
    cc.openChatFor({
      targetUserId: userId,
      selectedConversationId: getConversationId(userId),
    });
    if (type === "chat") {
      // handle Chat
      cc.setChatOpen();
    } else {
      //handle mail
      cc.setMailOpen(true);
    }
  };

  return (
    <>
      <Row>
        <Col
          span={24}
          style={{
            display:
              AmIFemale || isMobile
                ? "flex"
                : cc.isChatOpen
                ? "flex"
                : isMobile
                ? "block"
                : "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={
              isMobile
                ? {
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }
                : null
            }
          >
            {isMobile ? (
              <>
                <Button
                  className={`giftsBtn ${
                    (!verified || AmIFemale || cc.isChatOpen) && "margin"
                  }`}
                  icon={<MailOutlined className="btnIconGifts" />}
                  onClick={(e) => chatOrEmail(e, "mail")}
                >
                  SEND EMAIL
                </Button>
              </>
            ) : null}
            {isMobile && verified && !AmIFemale ? (
              <>
                <Button
                  onClick={() => onSendGift()}
                  className={`giftsBtn sendGift ${
                    (!verified || AmIFemale) && "margin"
                  }`}
                  icon={<GiftOutlined className="btnIconGifts" />}
                >
                  SEND GIFTS
                </Button>
              </>
            ) : null}
          </div>
          {!isMobile ? (
            <div
              className={
                !verified || AmIFemale
                  ? "div_class_flex"
                  : cc.isChatOpen
                  ? "centerRowGifts"
                  : "cardRowForGifts"
              }
            >
              <Button
                className={`giftsBtn ${
                  (!verified || AmIFemale || cc.isChatOpen) && "margin"
                }`}
                icon={<MailOutlined className="btnIconGifts" />}
                onClick={(e) => chatOrEmail(e, "mail")}
              >
                SEND EMAIL
              </Button>
              {verified && !AmIFemale ? (
                <>
                  <Button
                    onClick={() => onSendGift()}
                    className={`giftsBtn ${
                      (!verified || AmIFemale || cc.isChatOpen) && "margin"
                    }`}
                    icon={<GiftOutlined className="btnIconGifts" />}
                  >
                    SEND GIFTS
                  </Button>
                  <Button
                    className={`giftsBtn ${
                      (!verified || AmIFemale || cc.isChatOpen) && "margin"
                    }`}
                    onClick={() => onDateRequest()}
                    icon={<CalendarOutlined className="btnIconGifts" />}
                  >
                    SET UP A DATE
                  </Button>
                  <Button
                    className={`giftsBtn ${
                      (!verified || AmIFemale || cc.isChatOpen) && "margin"
                    }`}
                    icon={<PhoneOutlined className="btnIconGifts" />}
                    onClick={() => onContactExchange()}
                  >
                    EXCHANGE CONTACT
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}

          {isMobile ? (
            <Popover
              overlayClassName="gallery_clickPopOver"
              visible={popVisible}
              onVisibleChange={(v) => setPopVisible(v)}
              autoAdjustOverflow={false}
              trigger="click"
              placement="bottomRight"
              content={
                <>
                  <Col className="popMenuCol">
                    {verified && !AmIFemale ? (
                      <>
                        <Button
                          type="link"
                          className="menuBtnWhite"
                          onClick={() => {
                            setPopVisible(false);
                            onDateRequest();
                          }}
                          icon={<CalendarOutlined />}
                        >
                          SET UP A DATE
                        </Button>
                        <Button
                          type="link"
                          className="menuBtnWhite"
                          icon={<PhoneOutlined />}
                          onClick={() => {
                            setPopVisible(false);
                            onContactExchange();
                          }}
                        >
                          EXCHANGE CONTACT
                        </Button>
                      </>
                    ) : null}
                  </Col>
                </>
              }
              style={{ top: 10 }}
            >
              {AmIFemale || !verified ? null : (
                <Button
                  shape="round"
                  icon={<EllipsisOutlined />}
                  className="giftsWhiteBtn"
                />
              )}
            </Popover>
          ) : null}
        </Col>
      </Row>
    </>
  );
}

Gifts.defaultProps = {
  verified: false,
  onContactExchange: () => {},
  onDateRequest: () => {},
  onSendGift: () => {},
};

Gifts.propTypes = {
  verified: PropTypes.bool,
  onContactExchange: PropTypes.func,
  onDateRequest: PropTypes.func,
  onSendGift: PropTypes.func,
};

export default Gifts;
