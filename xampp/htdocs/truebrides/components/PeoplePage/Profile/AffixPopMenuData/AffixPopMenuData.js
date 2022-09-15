import React, { useContext } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Button, Affix } from "antd";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import {
  CalendarOutlined,
  MailOutlined,
  GiftOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import "./AffixPopMenuData.module.less";
import { ChatContext } from "@components";
import { getConversationId } from "@redux/utils/commonFunctions";

function AffixPopMenuData(props) {
  const {
    verified,
    onContactExchange,
    onDateRequest,
    onModalClose,
    onSendGift,
    userId,
  } = props;
  const cc = useContext(ChatContext);
  const { userData } = useSelector((state) => state.auth);

  const currentBP = useCurrentScreen();
  const isMobile = ["xs"].includes(currentBP);
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
    <Row
      className={
        !verified
          ? "popAffixRow"
          : AmIFemale
          ? "popAffixRow"
          : "popAffixRowActive"
      }
    >
      <Affix offsetTop={10} style={{ top: 10 }} className="optionMenuAffix">
        {isMobile ? (
          <Col className="popMenuCol">
            {!isMobile ? (
              <Button
                type="link"
                className="menuBtnWhite"
                icon={<MailOutlined />}
                onClick={(e) => chatOrEmail(e, "mail")}
              >
                SEND EMAIL
              </Button>
            ) : null}
            {verified && !AmIFemale ? (
              <>
                <Button
                  type="link"
                  className="menuBtnWhite"
                  icon={<GiftOutlined />}
                  onClick={() => {
                    onModalClose();
                    onSendGift();
                  }}
                >
                  SEND GIFTS
                </Button>
                <Button
                  type="link"
                  className="menuBtnWhite"
                  onClick={() => {
                    onModalClose();
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
                    onModalClose();
                    onContactExchange();
                  }}
                >
                  EXCHANGE CONTACT
                </Button>
              </>
            ) : null}
          </Col>
        ) : (
          <Col className="popMenuCol">
            {verified && !AmIFemale ? (
              <>
                <Button
                  type="link"
                  onClick={() => {
                    onModalClose();
                    onSendGift();
                  }}
                  className="menuBtnWhite"
                  icon={<GiftOutlined />}
                >
                  SEND GIFTS
                </Button>
                <Button
                  type="link"
                  className="menuBtnWhite"
                  onClick={() => {
                    onModalClose();
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
                    onModalClose();
                    onContactExchange();
                  }}
                >
                  EXCHANGE CONTACT
                </Button>
              </>
            ) : null}
          </Col>
        )}
      </Affix>
    </Row>
  );
}

AffixPopMenuData.defaultProps = {
  online: false,
  verified: false,
  onContactExchange: () => {},
  onDateRequest: () => {},
  onSendGift: () => {},
  onModalClose: () => {},
  visible: false,
  userId: "",
};

AffixPopMenuData.propTypes = {
  online: PropTypes.bool,
  verified: PropTypes.bool,
  onContactExchange: PropTypes.func,
  onDateRequest: PropTypes.func,
  onModalClose: PropTypes.func,
  onSendGift: PropTypes.func,
  visible: PropTypes.bool,
  userId: PropTypes.number,
};

export default AffixPopMenuData;
