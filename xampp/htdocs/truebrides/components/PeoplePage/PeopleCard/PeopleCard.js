/* eslint-disable react/prop-types */
import React, { useContext, useState } from "react";
import Link from "next/link";
import Images from "@config/images";
import { ChatContext } from "@components";
import { Row, Typography, Col, Button, Skeleton, Tooltip } from "antd";
import {
  CameraOutlined,
  MessageOutlined,
  MailOutlined,
} from "@ant-design/icons";
import siteConfig from "@config/siteConfig";
import { has, isEmpty, size } from "lodash-es";
import { getConversationId } from "@redux/utils/commonFunctions";
import "./PeopleCard.module.less";
const { Text, Title } = Typography;

export default function PeopleCard({ data, type = "", isLoading = false }) {
  const cc = useContext(ChatContext);
  const [ell, setEll] = useState(false);

  if (isLoading) {
    return (
      <Col
        xs={12}
        sm={8}
        md={cc.isChatOpen ? 12 : 8}
        lg={cc.isChatOpen ? 12 : 8}
        xl={cc.isChatOpen ? 8 : 6}
        xxl={6}
      >
        <Skeleton.Button className="cardContainerSkeleton" active loading />
      </Col>
    );
  }

  const {
    user: { photos, name, online, userType },
    age,
    userId,
    verified,
  } = data;

  const filteredPhoto = photos.filter((item) => item.profilePicture);
  let count = size(photos);
  let prefrenceText = "";
  if (has(data, "malePreferences") && !isEmpty(data.malePreferences)) {
    prefrenceText = data.malePreferences;
  } else if (
    has(data, "femalePreferences") &&
    !isEmpty(data.femalePreferences)
  ) {
    // eslint-disable-next-line no-unused-vars
    prefrenceText = data.femalePreferences;
  }

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
    <Col
      xs={12}
      sm={8}
      md={cc.isChatOpen ? 12 : 8}
      lg={cc.isChatOpen ? 12 : 8}
      xl={cc.isChatOpen ? 8 : 6}
      xxl={6}
    >
      <Link as={`/people/${userId}`} href={`/people/${userId}`}>
        <a>
          <Row
            className="cardContainer"
            justify="space-between"
            style={{
              backgroundImage: `url(${siteConfig.imgUrl}${filteredPhoto[0].photo.path}), url(${siteConfig.imgUrl}images/blank-profile-picture.png)`,
            }} //second image is a fallback image incase if error occurs in first step
          >
            <Col span={24} className="wrapperCol imgGradient">
              <Row justify="end" align="middle">
                <span className={online ? "onlineTag" : "offlineTag"}>
                  {online ? "Online" : "Offline"}
                </span>
              </Row>
              <Row justify="start" align="middle">
                <Col span={24}>
                  <Row justify="center" align="middle" className="hoverArea">
                    <Col flex="auto" span={24} className="nameColClass">
                      <Tooltip placement="top" title={name}>
                        <Title
                          level={4}
                          className={
                            cc.isChatOpen ? "textSty_small" : "textSty"
                          }
                          ellipsis={{
                            rows: 1,
                            expandable: false,
                            onEllipsis: (e) => setEll(e),
                          }}
                        >
                          {name}
                        </Title>
                      </Tooltip>
                      <Title
                        level={4}
                        className={cc.isChatOpen ? "textSty_small" : "textSty"}
                      >
                        {age ? `, ${age}` : ``}
                      </Title>
                    </Col>
                    <Col className="cameraOutlin" span={24}>
                      <CameraOutlined className="camIcon" />
                      <Text className="text">{count}</Text>
                      {verified && userType === "Female" ? (
                        <Tooltip
                          placement="top"
                          title="This user is a verified user"
                        >
                          <img
                            src={Images.verifiedSVG}
                            className={
                              cc.isChatOpen ? "chatOpenLogo" : "verfiedLogo"
                            }
                          />
                        </Tooltip>
                      ) : (
                        ""
                      )}
                    </Col>
                  </Row>
                  <Row justify="center" align="center">
                    <Button
                      className={online ? "chatButton" : "emailButton"}
                      icon={online ? <MessageOutlined /> : <MailOutlined />}
                      type="primary"
                      onClick={(e) => chatOrEmail(e, online ? "chat" : "email")}
                    >
                      {online ? "Chat Now" : "Send Email"}
                    </Button>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </a>
      </Link>
    </Col>
  );
}
