import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Layout,
  Col,
  Row,
  Typography,
  Popover,
  Empty,
  Input,
  Skeleton,
  Badge,
} from "antd";
import {
  CloseOutlined,
  SearchOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { isEmpty, map } from "lodash";
import siteConfig from "@config/siteConfig";
import { ChatContext } from "@components";
import { useSelector } from "react-redux";
import "../MyContacts/MyContact.module.less";
import "./Chat.module.less";

const { Text, Title, Link } = Typography;

function Chat(props) {
  const { dismiss, setUnreadChats } = props;
  const cc = useContext(ChatContext);
  const { chatSummary, userData } = useSelector((state) => state.auth);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const currentBP = useCurrentScreen();
  const isSmall = ["sm", "md", "xs"].includes(currentBP);
  const [show, setShow] = useState(false);

  const listData = useMemo(() => {
    const res = [];
    let totalUnReads = 0;
    map(chatSummary, (s) => {
      let unReadCount = 0;
      map(cc.allChats, (a) => {
        if (a.conversationId == s.conversationId) {
          if (!a?.readDate && a?.receiverId == userData?.id) {
            unReadCount += 1;
          }
        }
      });
      totalUnReads += unReadCount;
      res.push({ ...s, unReadCount });
    });
    setUnreadChats && setUnreadChats(totalUnReads);
    return res;
  }, [cc?.allChats, chatSummary]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!isEmpty(chatSummary) && loading) {
      setLoading(false);
    }
  }, [chatSummary]);

  const handleChange = (value) => {
    setText(value);
  };

  const handleClick = (item) => {
    cc.setChatOpen(true);
    cc.openChatFor({
      targetUserId: item.opposingUserId,
      selectedConversationId: item.conversationId,
    });
    dismiss();
  };

  const toggleShowMoreLess = () => {
    cc.toggleHeight();
    setShow(!show);
  };

  let filterData = useMemo(() => {
    if (!isEmpty(text)) {
      return listData.filter((o) => {
        if (o?.opposingName.toLowerCase().includes(text.toLowerCase())) {
          return o;
        }
      });
    } else {
      return listData;
    }
  }, [text, listData]);

  return (
    <Layout
      className={
        isSmall
          ? "mobileChatModal"
          : cc.isChatOpen
          ? `openChatReq ${show && "openChatReq-active"}`
          : `chatRqstsClass ${show && "chatRqstsClass-active"}`
      }
    >
      <Row className="chatRowHeader" justify="space-between">
        <Title level={5} className="chatTitle">
          Chats
        </Title>
        <Link className="linkShowClass" onClick={() => toggleShowMoreLess()}>
          {listData?.length > 8
            ? isSmall
              ? null
              : show
              ? "SHOW LESS"
              : "SHOW MORE"
            : null}
        </Link>
      </Row>
      <Row>
        <Input
          placeholder="Search Contact"
          className="inputSearch"
          prefix={<SearchOutlined className="searchIcon" />}
          onChange={(e) => handleChange(e.target.value)}
          value={text}
        />
      </Row>
      <Row
        className={
          cc?.contactActive || isSmall
            ? "mobileChatRow"
            : `chatsRowMain ${show && "chatsRowMain-active"}`
        }
      >
        {loading ? (
          [...new Array(6)].map((item, ind) => {
            if (cc?.contactActive && ind > 6) {
              return;
            }
            return (
              <Col span={24} key={ind} className="skeletonRow">
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
            {filterData && !isEmpty(filterData) ? (
              filterData.map((item, index) => {
                const content = (
                  <div className="popoverImg">
                    <img
                      className="pop_img_cover"
                      src={`${siteConfig.imgUrl}${item.opposingPhotoUrl}`}
                      onError={(e) => {
                        e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                      }}
                    />
                    {item.isRead ? (
                      <CloseOutlined
                        className="closeIconPop"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      />
                    ) : null}
                  </div>
                );
                if (cc?.contactActive && index > 4) {
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
                      className={
                        item.unReadCount > 0
                          ? "rendercontactRow_read"
                          : "rendercontactRow"
                      }
                      onClick={() => {
                        handleClick(item, index);
                      }}
                    >
                      <Col className="img_chat_col">
                        <Col>
                          <Badge
                            count={item?.unReadCount || 0}
                            overflowCount={9}
                            offset={[-5, 1]}
                            size="small"
                          >
                            <img
                              src={`${siteConfig.imgUrl}${item.opposingPhotoUrl}`}
                              className="contactImg"
                              onError={(e) => {
                                e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                              }}
                            />
                          </Badge>
                          <div
                            className={
                              item.opposingOnline === true
                                ? "myContactIcon"
                                : "offlineIcon"
                            }
                          />
                        </Col>
                        <div className="chat_div_class">
                          <Row>
                            <Text
                              className={
                                item.unReadCount > 0
                                  ? "myContactStatus_read"
                                  : "myContactStatus"
                              }
                              ellipsis={true}
                            >
                              {item.opposingName}
                            </Text>
                          </Row>
                          {item.lastMessage ? (
                            <Text
                              className={
                                item.unReadCount > 0
                                  ? "myContactStatus_read"
                                  : "myContactStatus"
                              }
                              ellipsis={true}
                            >
                              {item.lastMessage || "Added to your contact"}
                            </Text>
                          ) : (
                            <Text className="myContactStatus" ellipsis={true}>
                              <CameraOutlined />
                            </Text>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Popover>
                );
              })
            ) : (
              <Empty
                className="no_chat_class"
                description={<Text>No Chats</Text>}
              />
            )}
          </>
        )}
      </Row>
    </Layout>
  );
}

Chat.defaultProps = {
  dismiss: () => {},
  allChats: [],
  setUnreadChats: () => {},
};

Chat.propTypes = {
  dismiss: PropTypes.func,
  allChats: PropTypes.array,
  setUnreadChats: PropTypes.func,
};

export default Chat;
