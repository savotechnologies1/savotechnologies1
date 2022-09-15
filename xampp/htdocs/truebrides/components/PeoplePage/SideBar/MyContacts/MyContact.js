import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Layout, Col, Row, Typography, Popover, Skeleton, Button } from "antd";
import PropTypes from "prop-types";
import { CloseOutlined } from "@ant-design/icons";
import fetchHelper from "@redux/utils/apiHelper";
import siteConfig from "@config/siteConfig";
import { isEmpty } from "lodash";
import { ChatContext } from "@components";
import { getConversationId } from "@redux/utils/commonFunctions";
import "../MyContacts/MyContact.module.less";

const { Text, Title } = Typography;

function MyContact(props) {
  const { isContactActive } = props;
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [relatedProfiles, setRelatedProfiles] = useState([]);
  const cc = useContext(ChatContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPicksData();
  }, []);

  const chatOrEmail = (e, type = "mail", pid) => {
    e.stopPropagation();
    e.preventDefault();
    cc.openChatFor({
      targetUserId: pid,
      selectedConversationId: getConversationId(pid),
    });
    if (type === "chat") {
      // handle Chat
      cc.setChatOpen();
    } else {
      //handle mail
      cc.setMailOpen(true);
    }
  };

  const getPicksData = async () => {
    let url = `Users/OppositeGender`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        setRelatedProfiles(res);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div>
      <Row className="rowHeader">
        <Title level={5} className="chatTitle">
          Suggestions for You
        </Title>
      </Row>
      {loading ? (
        [...new Array(5)].map((item, ind) => {
          if (cc?.contactActive && ind > 6) {
            return;
          }
          return (
            <Col span={24} key={ind} className="rendercontactRow">
              <Skeleton.Avatar
                shape="circle"
                style={{ width: 40, height: 40 }}
                loading={loading}
                active
              />
              <Skeleton
                title={false}
                paragraph={{ rows: 2 }}
                className="avatar_picksMessage"
                loading={loading}
                size={30}
                active
              />
            </Col>
          );
        })
      ) : (
        <>
          <Row
            className={
              cc.isChatOpen
                ? `openChatContact ${
                    isContactActive && "openChatContact-active"
                  }`
                : `rowMyContactBgColor ${
                    isContactActive && "rowMyContactBgColor-active"
                  }`
            }
          >
            {relatedProfiles.map((item, index) => {
              const content = (
                <div className="popoverImg">
                  <img
                    className="pop_img_cover"
                    src={`${siteConfig.imgUrl}${item.picturePath}`}
                    onError={(e) => {
                      e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                    }}
                  />
                  {item.isRead ? (
                    <CloseOutlined className="closeIconPop" />
                  ) : null}
                </div>
              );
              if (index > 4) {
                return;
              }
              return (
                <Popover
                  key={index}
                  content={content}
                  placement="right"
                  overlayClassName="pop_close_class"
                >
                  <Row
                    className="rendercontactRow"
                    onClick={() => router.push(`/people/${item.id}`)}
                  >
                    <Col className="img_chat_col">
                      <Col>
                        <img
                          src={`${siteConfig.imgUrl}${item.picturePath}`}
                          className="contactImg"
                          onError={(e) => {
                            e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                          }}
                        />
                        <span
                          className={
                            item.online === true
                              ? "myContactIcon"
                              : "offlineIcon"
                          }
                        />
                      </Col>
                      <Col style={{ width: "100%" }}>
                        <Row>
                          <Text className="myContactNameText" ellipsis={true}>
                            {item.name || "-"}
                          </Text>
                        </Row>
                        <Text
                          className={
                            item.online === true
                              ? "onPicksMessage"
                              : "picksMessage"
                          }
                          ellipsis={true}
                        >
                          {item.city},{item.country}
                        </Text>
                        {item.isRead ? null : (
                          <Button
                            onClick={(e) =>
                              chatOrEmail(
                                e,
                                item.online === true ? "chat" : "email",
                                item.id
                              )
                            }
                            type={item.online === true ? "ghost" : "primary"}
                            className={
                              item.online === true
                                ? "chat_reply_btn"
                                : "mail_reply_btn"
                            }
                          >
                            {item.online === true ? "Chat Now" : "Mail"}
                          </Button>
                        )}
                      </Col>
                    </Col>
                  </Row>
                </Popover>
              );
            })}
          </Row>
        </>
      )}
    </div>
  );
}

MyContact.defaultProps = {
  isContactActive: false,
};

MyContact.propTypes = {
  isContactActive: PropTypes.bool,
};

export default MyContact;
