/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  Layout,
  Col,
  Row,
  Typography,
  Affix,
  Button,
  Input,
  message,
  Tooltip,
  Popconfirm,
  Spin,
} from "antd";
import moment from "moment";
import {
  CloseOutlined,
  MailOutlined,
  LockFilled,
  LinkOutlined,
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { ChatContext, Gallery, Notify } from "@components";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import Images from "@config/images";
import siteConfig from "@config/siteConfig";
import fetchHelper from "@redux/utils/apiHelper";
import { cloneDeep, has, isEmpty, map, startsWith } from "lodash";
import Title from "antd/lib/typography/Title";
import { getAttachments } from "@redux/utils/commonFunctions";
import Lightbox from "react-image-lightbox";
import { Picker } from "emoji-mart";
import { useRouter } from "next/router";

const { Text } = Typography;

function MailBox(props) {
  const { isReadOnly, openProfile } = props;
  const { userData, token } = useSelector((state) => state.auth);
  const cc = useContext(ChatContext);
  const { setChatOpen, setMailOpen, targetUserCard, emailRead, setEmailRead } =
    cc;
  const router = useRouter();
  const currentBP = useCurrentScreen();
  const isSmall = ["sm", "md"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [chatMail, setChatMail] = useState(false); //Toggle Icon for switching between chat and mail
  const [replyTo, setReplyTo] = useState(false); // If is reply to other mail set the thread ID for which the mail is a reply
  const [mailIndex, setMailIndex] = useState(0);
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachmentList, setAttachmentList] = useState([]);
  const [openAttachment, setOpenAttachment] = useState(false); //  Index of attachment that is opend currently
  const [openGallery, setOpenGallery] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [lightboxPvt, setLightBoxPvt] = useState(false); // use to apply filter on private image

  const inputRef = useRef(null);

  const imagePath = targetUserCard?.user?.photos.find((i) => i.profilePicture)
    ?.photo?.path;

  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const _iOSDevice = !!window.navigator.platform.match(/iPhone/);
    setIsIos(_iOSDevice);
  }, []);

  useEffect(() => {
    if (attachmentList[openAttachment]) {
      if (
        !attachmentList[openAttachment]?.unlocked &&
        attachmentList[openAttachment]?.attachment.ownerId !== userData.id &&
        userData.userType === "Male"
      ) {
        // If attch is sent by me, Item will be unlocked
        // If unlock variable is false, item will locked
        // Only For male item will be locked

        setLightBoxPvt(true);
        let doc = document.getElementsByClassName("ril__imagePrev")[0];
        if (doc) {
          ReactDOM.render(lightboxCustomDiv, doc);
        }
      } else {
        let doc = document.getElementsByClassName("lightboxCustomDiv")[0];
        setLightBoxPvt(false);
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

  useEffect(() => {
    getAttachments();
  }, []);

  useEffect(() => {
    setMailSubject("");
    setMailBody("");
    setSelectedAttachments([]);
  }, [targetUserCard]);

  useEffect(() => {
    setMailIndex(0);
  }, [emailRead]);

  useEffect(() => {
    if (!isEmpty(replyTo)) {
      setMailSubject(getMailSubject(replyTo.subject));
    } else {
      setMailSubject("");
    }
  }, [replyTo]);

  const closeMailbox = () => {
    setChatOpen(false);
    setMailSubject("");
    setMailBody("");
    setSelectedAttachments([]);
    setEmailRead({});
  };

  const showAttachments = (data, index = 0) => {
    setAttachmentList(data);
    setOpenAttachment(index);
  };

  const validate = () => {
    if (isEmpty(mailSubject.trim())) {
      message.error("Email subject is required");
      return false;
    }
    if (isEmpty(mailBody.trim())) {
      message.error("Email body is required");
      return false;
    }
    if (mailSubject.length > 255) {
      message.error(
        "maximum upto 255 characters are only allowed for email subject"
      );
      return false;
    }
    if (mailBody.length > 5000) {
      message.error(
        "maximum upto 5000 characters are only allowed for email body"
      );
      return false;
    }
    return true;
  };

  const getMailSubject = (text) => {
    if (isEmpty(replyTo)) {
      return text;
    }
    if (startsWith(text, "RE:")) {
      return text;
    } else {
      return `RE: ${text}`;
    }
  };

  const sendMail = async () => {
    let url = `Mails`;
    const data = {
      body: mailBody,
      subject: mailSubject,
      receiverId: targetUserCard?.userId,
    };

    if (!isEmpty(selectedAttachments)) {
      let ma = [];
      map(selectedAttachments, (v) => {
        ma.push({
          attachmentId: v.id,
          mailId: 0,
          id: 0,
        });
      });
      data.mailAttachments = ma;
    }

    if (!isEmpty(replyTo)) {
      data.threadId = replyTo.threadId;
    }

    if (!validate()) {
      return;
    }

    setBtnLoading(true);
    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        Notify(
          "success",
          "Success!",
          res.message || res.Message || "Mail send successfully!"
        );
        closeMailbox();
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
      setBtnLoading(false);
    } catch (error) {
      console.log(error);
      setBtnLoading(false);
    }
  };

  const openReplyForm = (data) => {
    setReplyTo(data);
    setEmailRead({});
  };

  const handleUnlock = async (a, ind) => {
    let url = `MailAttachments/${a.id}/Unlock`;
    try {
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (res && !has(res, "ErrorCode")) {
        const oData = cloneDeep(emailRead);
        const threadIndex = oData.findIndex((i) => i.id === a.mailId);
        if (threadIndex > -1) {
          const newAttList = oData[threadIndex]?.mailAttachments.map((item) => {
            if (item.id === a.id) {
              return {
                ...item,
                unlocked: true,
              };
            } else {
              return item;
            }
          });
          oData.splice(threadIndex, 1, {
            ...oData[threadIndex],
            mailAttachments: newAttList,
          });
          setEmailRead(oData);
          showAttachments(newAttList, ind);
        }
      } else {
        showAttachments([], -1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const MailListView = ({ mailItem, index }) => {
    const senderImg = mailItem?.sender?.photos.find((i) => i.profilePicture)
      ?.photo?.path;
    const isOpend = mailIndex == index;
    return (
      <div
        className={`flexHeight mt5 ${!isOpend && "collapsed"}`}
        onClick={() => setMailIndex(index)}
      >
        <Row
          className={`mail_row_up f9 ${!isOpend && "hoverDarken"}`}
          justify="center"
        >
          <Row justify="start" align="middle">
            <Col
              flex="75px"
              onClick={(e) => {
                e.preventDefault();
                if (router.asPath !== `/people/${openProfile}`)
                  router.push(`/people/${openProfile}`);
              }}
            >
              <img
                src={`${siteConfig.imgUrl}${senderImg}` || Images.maleAvatar}
                className="chatPic"
                onError={(e) => {
                  e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                }}
              />
              <div
                className={
                  mailItem?.receiverId === targetUserCard?.userId
                    ? null
                    : mailItem?.sender?.online === true
                    ? "replyonlineCirle"
                    : "replyOfflineCirle"
                }
              />
            </Col>
            <Col flex="6">
              <Row>
                <Text className="peopleNameText">{mailItem?.sender?.name}</Text>
              </Row>
              <Row>
                <Text type="secondary">
                  To:{" "}
                  {mailItem.receiverId == userData.id
                    ? "Me"
                    : mailItem.receiver.name}
                </Text>
              </Row>
            </Col>
            {isOpend ? (
              <Col flex="4" className="timeCol">
                {moment(mailItem.sendDate).format("DD MMM YYYY, HH:mm")}
              </Col>
            ) : (
              <Col flex="4" className="timeCol-Collapsed">
                <span>
                  {moment(mailItem.sendDate).format("DD MMM YYYY, HH:mm")}
                </span>
                <Button
                  loading={btnLoading}
                  disabled={btnLoading}
                  className="replyLinkBtn"
                  type="link"
                  onClick={() => openReplyForm(mailItem)}
                >
                  REPLY
                </Button>
              </Col>
            )}
          </Row>
          <Row justify="center" align="middle">
            <Col span={24}>
              <Title level={4} className="subjectHeading">
                {mailItem.subject}
              </Title>
            </Col>
          </Row>
          {!isEmpty(mailItem.mailAttachments) && (
            <Col style={{ position: "relative" }}>
              {renderAttachmentPreviewReadOnly(mailItem.mailAttachments)}
            </Col>
          )}
          <Row style={{ maxWidth: "100%" }}>
            <Col span={24}>
              <Text className="mailBodyText">{mailItem.body}</Text>
            </Col>
          </Row>
          <Row justify="center" align="bottom" className="mail_btn_row">
            <Col className="mail_sendmail_btn">
              <Button
                loading={btnLoading}
                disabled={btnLoading}
                className="emailButton"
                type="primary"
                onClick={() => openReplyForm(mailItem)}
              >
                REPLY
              </Button>
            </Col>
          </Row>
        </Row>
      </div>
    );
  };

  const renderAttachmentPreviewReadOnly = (list) => {
    const amIMale = userData.userType === "Male";
    return (
      <>
        <div
          className="attPreviewDiv noselect"
          style={{ alignItems: "center" }}
        >
          {list.map((a, index) => {
            const isLocked =
              amIMale && //Only For male item will be locked
              has(a, "unlocked") && // If unlock variable is false, item will locked
              !a.unlocked &&
              a.attachment.ownerId !== userData.id; // If attch is sent by me, Item will be unlocked
            return (
              <>
                <div
                  onClick={() =>
                    isLocked ? null : showAttachments(list, index)
                  }
                  key={a.id}
                  style={
                    index === 0
                      ? { paddingLeft: 5 }
                      : index === list.length - 1
                      ? { paddingRight: 5 }
                      : {}
                  }
                >
                  {isLocked ? (
                    <Popconfirm
                      overlayClassName="deleteConfirmPop"
                      title="Do you want to unlock this picture?"
                      onConfirm={() => handleUnlock(a, index)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <div className="lockedImgWrapper">
                        <LockFilled className="lockIndicatior" />
                        <img
                          onDragStart={(e) => e.preventDefault()}
                          src={`${siteConfig.imgUrl}${a.attachment.path}`}
                          className={`attPreviewImg ${
                            isLocked && "lockedImage2"
                          }`}
                        />
                      </div>
                    </Popconfirm>
                  ) : (
                    <>
                      <img
                        src={`${siteConfig.imgUrl}${a.attachment.path}`}
                        className="attPreviewImg"
                      />
                    </>
                  )}
                </div>
              </>
            );
          })}
        </div>
      </>
    );
  };

  const renderAttachmentPreview = () => {
    if (!isEmpty(selectedAttachments)) {
      return (
        <>
          <Tooltip placement="topLeft" title="Clear all attachments">
            <CloseOutlined
              className="attCloseBtn"
              onClick={() => setSelectedAttachments([])}
            />
          </Tooltip>
          <div className="attPreviewDiv noselect">
            {selectedAttachments.map((a, index) => {
              return (
                <>
                  <span
                    type="text"
                    key={a.id}
                    style={
                      index === 0
                        ? { paddingLeft: 5 }
                        : index === selectedAttachments.length - 1
                        ? { paddingRight: 5 }
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
                          <QuestionCircleOutlined style={{ color: "red" }} />
                        }
                      >
                        <CloseOutlined className="mailChatOnPhoto" />
                      </Popconfirm>
                    </Spin>
                    <img
                      onDragStart={(e) => e.preventDefault()}
                      src={`${siteConfig.imgUrl}${a.path}`}
                      className="attPreviewImg"
                    />
                  </span>
                </>
              );
            })}
          </div>
        </>
      );
    }
  };

  const renderGallery = () => {
    return (
      <>
        <Gallery
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
            mainSrc={`${siteConfig.imgUrl}${attachmentList[openAttachment]?.attachment?.path}`}
            nextSrc={
              attachmentList[(openAttachment + 1) % attachmentList?.length]
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
      </>
    );
  };

  if (isReadOnly) {
    return (
      <Affix offsetTop={isMobile ? 65 : isSmall ? 73 : 97}>
        <Layout className="mailInboxLayout">
          <div className="backNDeleteBtns">
            <Button
              type="text"
              className="goBackBtn"
              icon={<ArrowLeftOutlined />}
              onClick={() => closeMailbox()}
            />
          </div>
          <div
            className="scrollContainer"
            style={{ marginBottom: isIos ? 120 : 0 }}
          >
            {emailRead.map((item, index) => (
              <MailListView key={item.id} mailItem={item} index={index} />
            ))}
          </div>
        </Layout>
        {renderGallery()}
      </Affix>
    );
  }

  let emojiPickerState;
  if (emojiPicker) {
    emojiPickerState = (
      <Picker
        include={["recent", "people", "nature", "activity"]}
        onSelect={(emoji) => {
          const cursorPostion =
            inputRef.current?.resizableTextArea.textArea?.selectionStart;
          const updatedString = mailBody
            .slice(0, cursorPostion)
            .concat(emoji.native)
            .concat(mailBody.slice(cursorPostion));
          setMailBody(updatedString);
          setEmojiPicker(false);
          inputRef.current.focus();
        }}
      />
    );
  }

  const triggerPicker = () => {
    setEmojiPicker(!emojiPicker);
  };

  return (
    <Affix
      offsetTop={isMobile ? 65 : isSmall ? 73 : 97}
      className="chat_affix_top"
    >
      {renderGallery()}
      <Layout className="mailInboxLayout">
        <Row onClick={() => setEmojiPicker(false)} className="mail_row">
          <Col className="mail_col">
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
                    ? "onlineCircleMail"
                    : "offlineCircleMail"
                }
              />
              <Text ellipsis={true} className="chatName">
                {targetUserCard?.user?.name}
              </Text>
            </span>

            <span>
              <div className="top_section_right">
                {chatMail ? (
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
                        setChatOpen(true);
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
        <span className="mail_span_class">
          <Row className="mail_row_up" justify="center">
            <Col className="mail_input_subject">
              <Input
                placeholder="Subject"
                className="mail_input_class"
                value={mailSubject}
                onChange={(e) => setMailSubject(e.target.value)}
              />
              <Tooltip placement="topLeft" title="Add attachments">
                <Button
                  icon={<LinkOutlined />}
                  type="text"
                  className="attachBtn"
                  onClick={() => setOpenGallery(true)}
                />
              </Tooltip>
            </Col>
            <Col style={{ position: "relative" }}>
              {renderAttachmentPreview()}
            </Col>
            <Col style={{ padding: 10, flex: 1 }} className="col_emoji">
              <Input.TextArea
                ref={inputRef}
                className="mail_textarea"
                placeholder="Type your message..."
                autoSize={{ minRows: 3, maxRows: 3 }}
                value={mailBody}
                onChange={(e) => setMailBody(e.target.value)}
                maxLength={5000}
              />
              <Button
                type="ghost"
                className="smile_btn"
                icon={
                  <SmileOutlined
                    onClick={() => {
                      triggerPicker();
                    }}
                  />
                }
              />
            </Col>
            {emojiPickerState}
            <Row justify="center" align="bottom" className="mail_btn_row">
              <Col className="mail_sendmail_btn">
                <Button
                  loading={btnLoading}
                  disabled={btnLoading}
                  className="sendemailButton"
                  type="primary"
                  icon={<MailOutlined />}
                  onClick={() => sendMail()}
                >
                  SEND EMAIL
                </Button>
              </Col>
            </Row>
          </Row>
        </span>
      </Layout>
    </Affix>
  );
}

MailBox.defaultProps = {
  isReadOnly: false,
  openProfile: () => {},
};

MailBox.propTypes = {
  isReadOnly: PropTypes.bool,
  openProfile: PropTypes.func,
};

export default MailBox;
