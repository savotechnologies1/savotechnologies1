import React, { useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  Layout,
  Col,
  Row,
  Typography,
  Button,
  Affix,
  Input,
  Spin,
  Tooltip,
  Popconfirm,
} from "antd";
import { ChatContext, Gallery } from "@components";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import Images from "@config/images";
import { getDaysFar, getAttachments } from "@redux/utils/commonFunctions";
import {
  CloseOutlined,
  CameraOutlined,
  SmileOutlined,
  SendOutlined,
  QuestionCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import siteConfig from "@config/siteConfig";
import { cloneDeep, has, isEmpty, size } from "lodash";
import Lightbox from "react-image-lightbox";
import { Picker } from "emoji-mart";
import { useRouter } from "next/router";
import ScrollView from "react-inverted-scrollview";
import "./emojiMart.module.less";
import fetchHelper from "@redux/utils/apiHelper";

const { Text } = Typography;

function ChatBox(props) {
  const {
    data,
    onChatSend,
    chatPagination,
    loadMoreChats,
    chatLoader,
    openProfile,
    updateLockSate,
  } = props;
  const router = useRouter();
  const currentBP = useCurrentScreen();
  const isSmall = ["sm", "md"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);
  const { token, userData } = useSelector((state) => state.auth);
  const cc = useContext(ChatContext);
  const { setChatOpen, targetUserCard, setMailOpen } = cc;
  const [chatInput, setChatInput] = useState("");
  const imagePath = targetUserCard?.user?.photos.find((i) => i.profilePicture)
    ?.photo?.path;
  const [chatMail, setChatMail] = useState(false);
  const [loading, setLoading] = useState(false);
  //Handle Attachments
  const [openAttachment, setOpenAttachment] = useState(false); //  Index of attachment that is opend currently in Lighbox
  const [openGallery, setOpenGallery] = useState(false);
  const [attachmentList, setAttachmentList] = useState([]);
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [lightboxPvt, setLightBoxPvt] = useState(false); // use to apply filter on private image
  const [isIos, setIsIos] = useState(false);

  const [bottomBtn, setBottomBtn] = useState(false); // It shows scroll to bottom for chats while scrolled up.

  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const _iOSDevice = !!window.navigator.platform.match(/iPhone/);
    setIsIos(_iOSDevice);
  }, []);

  const handleScroll = ({ scrollTop, scrollBottom }) => {
    if (scrollTop < 50 && !chatLoader && chatPagination.hasMore) {
      loadMoreChats();
    }
    //This condition to show/hide bottom button
    if (scrollBottom > 500) {
      if (!bottomBtn) {
        setBottomBtn(true);
      }
    } else {
      if (bottomBtn) {
        setBottomBtn(false);
      }
    }
  };

  useEffect(() => {
    //reset scroll pos when chat profile changed
    setBottomBtn(false);
    if (
      scrollViewRef &&
      scrollViewRef.current &&
      !isEmpty(scrollViewRef.current)
    ) {
      const interval = setInterval(() => {
        scrollViewRef && scrollViewRef?.current?.setScrollBottom(0);
      }, 10);
      setTimeout(() => {
        clearInterval(interval);
      }, 500);
    }
  }, [openProfile]);

  useEffect(() => {
    getAttachments();
  }, []);

  useEffect(() => {
    if (
      openAttachment >= 0 &&
      !isEmpty(attachmentList) &&
      attachmentList[openAttachment]
    ) {
      if (
        !attachmentList[openAttachment]?.unlocked &&
        attachmentList[openAttachment].attachment.ownerId !== userData.id &&
        userData.userType === "Male"
      ) {
        setLightBoxPvt(true);
        setTimeout(() => {
          let doc = document.getElementsByClassName("ril__imagePrev")[0];
          if (doc) {
            ReactDOM.render(lightboxCustomDiv, doc);
          }
        }, 10);
      } else {
        setLightBoxPvt(false);
        let doc = document.getElementsByClassName("lightboxCustomDiv")[0];
        if (doc) {
          doc.remove();
        }
      }
    }
  }, [openAttachment, attachmentList]);

  const lightboxCustomDiv = (
    <div className="lightboxCustomDiv">
      <span className="lockedText">This picture is private.</span>
      <Button
        type="primary"
        size="large"
        style={{ borderRadius: 5 }}
        onClick={() =>
          handleUnlock(attachmentList[openAttachment], openAttachment)
        }
      >
        Unlock
      </Button>
    </div>
  );

  const handleMsgSend = () => {
    onChatSend(chatInput, "", selectedAttachments); // (chatmessageText, ReceiverId, attachment Array)
    setChatInput("");
    setSelectedAttachments([]);
  };

  const handleUnlock = async (a, ind) => {
    let url = `ChatAttachments/${a.id}/Unlock`;
    try {
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (res && !has(res, "ErrorCode")) {
        updateLockSate({ ...a, unlocked: true });
        const calist = [...attachmentList];
        calist.splice(ind, 1, { ...a, unlocked: true });
        setAttachmentList(calist);
      } else {
        showAttachments([], -1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDateLabel = (index) => {
    if (index === 0 && !chatPagination.hasMore) {
      return (
        <Row justify="center" align="middle" className="dateLabel">
          <Col>
            <Text className="start_conversation">
              {getDaysFar(moment(data[index].sendDate))}
            </Text>
          </Col>
        </Row>
      );
    }
    if (index > 0) {
      const a = moment(data[index - 1].sendDate);
      const b = moment(data[index]?.sendDate);
      let sameDay = a.isSame(b, "day");
      if (sameDay) {
        return <></>;
      } else {
        return (
          <Row justify="center" align="middle" className="dateLabel">
            <Col>
              <Text className="start_conversation">{getDaysFar(b)}</Text>
            </Col>
          </Row>
        );
      }
    }
  };

  const uploadPhoto = () => {
    return (
      <Button
        type="ghost"
        icon={<CameraOutlined />}
        className="camera_icon_btn"
        onClick={() => setOpenGallery(true)}
      />
    );
  };

  const showAttachments = (data, index = 0) => {
    setAttachmentList(data);
    setOpenAttachment(index);
  };

  const renderAttachments = (attachments, isByMe, haveMessage) => {
    let span = 12;
    if (attachments.length < 4) {
      span = 24;
    }
    let data = attachments.slice(0, 4);
    const amIMale = userData.userType === "Male";
    return (
      <Row className="noselect">
        <Col span={16} offset={isByMe ? 8 : 0}>
          <Row
            className={`attachmentDiv ${isByMe && "attachmentDiv-byme"}`}
            style={
              haveMessage
                ? {
                    marginBottom: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }
                : {
                    marginBottom: 5,
                  }
            }
            onClick={() => showAttachments(attachments)}
          >
            {data.map((ca, index) => {
              const hasMore = attachments.length > 4 && index === 3;
              const moreCount = attachments.length - 4;
              const isLocked =
                !isByMe && amIMale && has(ca, "unlocked") && !ca.unlocked;
              return (
                <Col
                  key={ca.id}
                  span={span}
                  className="attImageCol"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showAttachments(attachments, index);
                  }}
                >
                  <img
                    onDragStart={(e) => e.preventDefault()}
                    src={`${siteConfig.imgUrl}${ca.attachment.path}`}
                    className={`attachmentImg ${hasMore && "haveMoreImages"} ${
                      isLocked && "lockedImage"
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                    }}
                  />
                  {hasMore && (
                    <Text className="moreImageCount">+{moreCount}</Text>
                  )}
                </Col>
              );
            })}
          </Row>
        </Col>
      </Row>
    );
  };

  let emojiPickerState;
  if (emojiPicker) {
    emojiPickerState = (
      <Picker
        include={["recent", "people", "nature", "activity"]}
        onSelect={(emoji) => {
          const cursorPostion = inputRef.current?.input?.selectionStart;
          const updatedString = chatInput
            .slice(0, cursorPostion)
            .concat(emoji.native)
            .concat(chatInput.slice(cursorPostion));
          setChatInput(updatedString);
          setTimeout(() => {
            inputRef.current.setSelectionRange(
              cursorPostion + 2,
              cursorPostion + 2
            );
          }, 3);
          inputRef.current.focus();
        }}
      />
    );
  }

  const triggerPicker = () => {
    setEmojiPicker(!emojiPicker);
  };

  return (
    <Affix offsetTop={isMobile ? 65 : isSmall ? 73 : 97}>
      <Layout className="chatInboxLayout">
        <Row onClick={() => setEmojiPicker(false)}>
          <Col className="chatHeadRow">
            <span
              className="chat_head_name"
              onClick={(e) => {
                e.preventDefault();
                if (router.asPath !== `/people/${openProfile}`)
                  router.push(`/people/${openProfile}`);
                if (isMobile) {
                  setChatOpen(false);
                }
              }}
            >
              <img
                src={`${siteConfig.imgUrl}${imagePath}` || Images.maleAvatar}
                className="chatPic"
                onError={(e) => {
                  e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                }}
              />
              <div
                className={
                  targetUserCard?.user?.online === true
                    ? "onlineCircleChat"
                    : "offlineCircleChat"
                }
              />
              <Text ellipsis={true} className="chatName">
                {targetUserCard?.user?.name}
              </Text>
            </span>
            <span>
              <div className="top_section_right">
                {!chatMail ? (
                  <Tooltip placement="topRight" title="Mails">
                    <Button
                      type="link"
                      className="chatBtnChatInbox"
                      icon={
                        <img
                          src={Images.emailIcon}
                          className="chatBtnChatInbox"
                        />
                      }
                      onClick={() => {
                        setChatMail(true);
                        setMailOpen(true);
                      }}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip placement="topRight" title="Chats">
                    <Button
                      type="link"
                      className="chatBtnChatInbox"
                      icon={
                        <img
                          src={Images.conversation}
                          className="chatBtnChatInbox"
                        />
                      }
                      onClick={() => {
                        setChatMail(true);
                        setMailOpen(false);
                      }}
                    />
                  </Tooltip>
                )}
                <Tooltip
                  placement="top"
                  title="Close"
                  arrowPointAtCenter
                  overlayClassName="tooltip_close_class"
                >
                  <CloseOutlined
                    className="closeIconChat"
                    onClick={() => {
                      setChatOpen(false);
                    }}
                  />
                </Tooltip>
              </div>
            </span>
          </Col>
        </Row>
        <Row className="chatRow" justify="center">
          <Col
            span={isMobile ? 24 : 23}
            onClick={() => setEmojiPicker(false)}
            style={{ height: "100%", position: "relative" }}
            className="chatCol"
          >
            {bottomBtn && (
              <DownOutlined
                className="goBottomBtn"
                onClick={() => scrollViewRef.current.setScrollBottom(0)}
              />
            )}
            <ScrollView
              width="100%"
              height="100%"
              ref={scrollViewRef}
              onScroll={handleScroll}
            >
              {chatLoader && (
                <Row justify="center" align="middle" style={{ marginTop: 30 }}>
                  <Spin spinning />
                </Row>
              )}
              {!chatPagination.hasMore && (
                <Row justify="center" align="middle" className="dateLabel">
                  <Col>
                    <Text className="start_conversation">
                      Start of Conversation
                    </Text>
                  </Col>
                </Row>
              )}
              {data &&
                !isEmpty(data) &&
                data.map((o, index) => {
                  const isByMe = o.senderId == userData.id;
                  const haveAttachments =
                    o?.chatAttachments && !isEmpty(o.chatAttachments);
                  const haveMessage =
                    o?.content && size(o.content.toString().trim()) > 0;
                  return (
                    <>
                      {getDateLabel(index)}
                      <Row key={o.id}>
                        <Col
                          offset={isByMe ? 4 : 0}
                          span={20}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isByMe ? "flex-end" : "flex-start",
                          }}
                        >
                          {haveAttachments &&
                            renderAttachments(
                              o.chatAttachments,
                              isByMe,
                              haveMessage
                            )}
                          {haveMessage && (
                            <div
                              className={`${
                                isByMe ? "chatTextRigth" : "chatTextLeft"
                              } ${haveAttachments && "chatTextWithAttachment"}`}
                            >
                              <Text>{o.content}</Text>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </>
                  );
                })}
            </ScrollView>
          </Col>
        </Row>
        <Row className="chatFooterRow">
          {!isEmpty(selectedAttachments) && (
            <div className="footer_chat_div">
              <CloseOutlined
                className="attCloseBtn"
                onClick={() => setSelectedAttachments([])}
              />
              <div className="attPreviewDiv">
                {selectedAttachments.map((a, index) => {
                  return (
                    <>
                      <span
                        type="text"
                        key={a.id}
                        style={
                          index === 0
                            ? { paddingLeft: 0 }
                            : index === selectedAttachments.length - 1
                            ? { paddingRight: 0 }
                            : {}
                        }
                      >
                        <Spin
                          wrapperClassName="spinning_class"
                          spinning={a.id === loading}
                        >
                          <Popconfirm
                            overlayClassName="deleteConfirmPop"
                            title="Do you want to remove this from attachments?"
                            onConfirm={() => {
                              setLoading(a.id);
                              let arr = cloneDeep(selectedAttachments);
                              arr.splice(index, 1);
                              setSelectedAttachments([...arr]);
                            }}
                            okText="Yes"
                            cancelText="No"
                            placement="top"
                            trigger="click"
                            icon={
                              <QuestionCircleOutlined
                                style={{ color: "red" }}
                              />
                            }
                          >
                            <CloseOutlined className="mailChatOnPhoto" />
                          </Popconfirm>
                        </Spin>
                        <img
                          src={`${siteConfig.imgUrl}${a.path}`}
                          className="attPreviewImg"
                        />
                      </span>
                    </>
                  );
                })}
              </div>
            </div>
          )}
          <div className={isIos ? "iosEmojiFooter" : "emoji_footer_div"}>
            <Col span={24} className="chatInputBtn">
              <div className="chat_footer_div">
                <Input
                  ref={inputRef}
                  placeholder="Type your message"
                  value={chatInput}
                  onKeyDown={(e) => e.keyCode == 13 && handleMsgSend()}
                  onChange={(e) => setChatInput(e.target.value)}
                  prefix={uploadPhoto()}
                  maxLength={500}
                  suffix={
                    <SmileOutlined
                      onClick={() => {
                        triggerPicker();
                      }}
                    />
                  }
                />
                <Button
                  type="primary"
                  className="chatSendBtn"
                  onClick={() => {
                    handleMsgSend();
                    setEmojiPicker(false);
                  }}
                  icon={<SendOutlined />}
                />
              </div>
            </Col>
            {emojiPickerState}
          </div>
        </Row>
        <Gallery
          maxLimit={4}
          allowMultiselect={true}
          visible={openGallery}
          dismiss={() => setOpenGallery(false)}
          onSelect={(o) => setSelectedAttachments(o)}
        />
        {openAttachment >= 0 && !isEmpty(attachmentList) && (
          <Lightbox
            enableZoom={false}
            discourageDownloads
            wrapperClassName={`${lightboxPvt && "lightboxPvtImage"} ${
              attachmentList.length === 1 ? "lightboxWrapper" : ""
            }`}
            mainSrc={`${siteConfig.imgUrl}${attachmentList[openAttachment].attachment.path}`}
            nextSrc={
              attachmentList[(openAttachment + 1) % attachmentList.length]
            }
            prevSrc={
              attachmentList[
                (openAttachment + attachmentList.length - 1) %
                  attachmentList.length
              ]
            }
            onCloseRequest={() => {
              setOpenAttachment(-1);
              setAttachmentList([]);
            }}
            onMovePrevRequest={() =>
              attachmentList.length > 1
                ? setOpenAttachment(
                    (openAttachment + attachmentList.length - 1) %
                      attachmentList.length
                  )
                : {}
            }
            onMoveNextRequest={() => {
              attachmentList.length > 1
                ? setOpenAttachment(
                    (openAttachment + 1) % attachmentList.length
                  )
                : {};
            }}
          />
        )}
      </Layout>
    </Affix>
  );
}

ChatBox.defaultProps = {
  data: [],
  onChatSend: () => {},
  chatPagination: {},
  loadMoreChats: () => {},
  openProfile: () => {},
  updateLockSate: () => {},
  chatLoader: false,
  newMsgFlag: false,
  oldMsgFlag: false,
};

ChatBox.propTypes = {
  data: PropTypes.array,
  onChatSend: PropTypes.func,
  chatPagination: PropTypes.object,
  loadMoreChats: PropTypes.func,
  openProfile: PropTypes.func,
  updateLockSate: PropTypes.func,
  chatLoader: PropTypes.bool,
  newMsgFlag: PropTypes.bool,
  oldMsgFlag: PropTypes.bool,
};

export default ChatBox;
