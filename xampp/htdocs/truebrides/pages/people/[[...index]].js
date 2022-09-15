import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { Affix, Col, Layout, Row } from "antd";
import {
  ContentData,
  CHeader,
  MyContact,
  Chat,
  ChatBox,
  ChatContext,
  Notify,
  MailBox,
} from "@components";
import * as signalR from "@microsoft/signalr";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import Head from "next/head";
import "./peopleIndex.module.less";
import fetchHelper from "@redux/utils/apiHelper";
import { cloneDeep, has, isArray, isEmpty, map, maxBy, unionBy } from "lodash";
import siteConfig from "@config/siteConfig";
import {
  getBadgeCount,
  getChatSummary,
  getLatestNotifications,
} from "@redux/utils/commonFunctions";
import useNotifySound from "@redux/utils/useNotifySound";

const { Header, Content } = Layout;

export default function people() {
  const currentBP = useCurrentScreen();
  const router = useRouter();
  const { userData, token, chatSummary, userProfile } = useSelector(
    (state) => state.auth
  );
  const isMobile = ["xs"].includes(currentBP);
  const isLg = ["lg"].includes(currentBP);
  //States for Layout setting
  const [startOffset, setStartOffset] = useState(3);
  const [span, setSpan] = useState(3);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [contactActive, setContactActive] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);

  //Actual state Data
  const notifyTone = useNotifySound();
  const [chatHubConnection, setChatHubConnection] = useState({});
  const [targetUserCard, setTargetUserCard] = useState([]);
  const [currentChats, setCurrentChats] = useState({
    targetUserId: "",
    selectedConversationId: "",
  });
  const [liveChatMessages, setLiveChatMessages] = useState([]); //Its live state listens and updates when message comes in
  const [chatsBetween, setChatsBetween] = useState([]);
  const [emailRead, setEmailRead] = useState({}); //Entire Thread Data when a thread is click to see
  const [chatPagination, setChatPagination] = useState({
    hasMore: false,
    lastId: 0,
  });
  const [chatLoader, setChatLoader] = useState(false);
  const liveChatRef = useRef();
  const ccRef = useRef();
  liveChatRef.current = liveChatMessages;
  ccRef.current = currentChats;

  const chatContextValue = {
    isChatOpen,
    targetUserCard,
    emailRead,
    setEmailRead,
    setChatOpen: (flag = true) => {
      setMailOpen(false);
      setIsChatOpen(flag);
    },
    openChatFor: (n) => setCurrentChats(n),
    setMailOpen: (value, keep = false) => {
      if (value && !keep) {
        //Clear Old Inbox Message before opening.
        setEmailRead({});
      }
      setMailOpen(value);
      setIsChatOpen(true);
    },
    onChatSend: (m, rcvId, attachment) => sendChatMsg(m, rcvId, attachment),
    toggleHeight: () => setContactActive(!contactActive), //height adjustment
  };

  useEffect(() => {
    if (["xxl"].includes(currentBP)) {
      setStartOffset(isChatOpen ? 0 : 3);
    } else if (["xl"].includes(currentBP)) {
      setStartOffset(isChatOpen ? 0 : 1);
    } else if (["lg"].includes(currentBP)) {
      setStartOffset(isChatOpen ? 0 : 1);
    } else {
      setStartOffset(0);
    }
  }, [currentBP, isChatOpen]);

  useEffect(() => {
    if (startOffset > 0) {
      if (startOffset === 1) {
        setSpan(17);
      } else {
        setSpan(15);
      }
    } else {
      setSpan(24);
    }
  }, [startOffset]);

  useEffect(() => {
    if (token) {
      signalRInit();
      getChatSummary();
      getRecentChats();
      getBadgeCount();
      getLatestNotifications();
    }
  }, []);

  useEffect(() => {
    if (!isChatOpen) {
      setCurrentChats({
        targetUserId: "",
        selectedConversationId: "",
      });
      setChatsBetween([]);
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (!isEmpty(chatHubConnection)) {
      chatHubConnection.on("receiveMessage", handleReceivedMsg);
    }

    return () => {
      if (!isEmpty(chatHubConnection)) {
        chatHubConnection.stop();
        console.log("##Chathub SignalR Stoppedd");
      }
    };
  }, [chatHubConnection]);

  useEffect(() => {
    if (currentChats.targetUserId > 0) getTargetUserDetails();
    if (currentChats.selectedConversationId > 0) {
      getFullConversation();
      setConversationRead();
      //TODO: Verify set Conversation As Read
    }
  }, [currentChats]);

  const signalRInit = () => {
    const protocol = new signalR.JsonHubProtocol();
    const transport = signalR.HttpTransportType.WebSockets;
    const options = {
      transport,
      logMessageContent: false,
      logger: signalR.LogLevel.Error,
      skipNegotiation: true,
      accessTokenFactory: () => token,
    };
    // create the connection instance
    var hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${siteConfig.hubUrl}chathub/`, options)
      .withAutomaticReconnect()
      .withHubProtocol(protocol)
      .build();

    hubConnection
      .start()
      .then(() => console.info("##ChatPage SignalR Connected"))
      .catch((err) =>
        console.error("##ChatPage SignalR Connection Error: ", err)
      );
    setChatHubConnection(hubConnection);
  };

  useEffect(() => {
    const cb = liveChatMessages.filter(
      (m) => m.conversationId == currentChats.selectedConversationId
    );
    cb.sort((a, b) => (a.id > b.id ? 1 : -1));
    setChatsBetween(cb);
  }, [liveChatMessages, currentChats?.selectedConversationId]);

  const getRecentChats = async () => {
    let url = `ChatMessages/GetUsersChatMessages`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        setLiveChatMessages(unionBy([...liveChatRef.current], res, "id"));
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setConversationRead = async () => {
    let url = `ChatMessages/SetConversationRead`;
    const data = {
      conversationId: currentChats.selectedConversationId,
      userId: userData.id,
    };

    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
    } catch (error) {
      console.log(error);
    }

    //Updating in UI
    const lms = liveChatRef.current;
    if (isArray(lms) && !isEmpty(lms)) {
      map(lms, (v, i) => {
        if (currentChats.selectedConversationId === v.conversationId) {
          lms[i] = {
            ...v,
            readDate: new Date(),
          };
        }
      });
      setLiveChatMessages(lms);
    }
  };

  const getFullConversation = async (pagination = false) => {
    if (chatLoader) {
      return true;
    }

    let lastId;

    if (!pagination) {
      const cb = liveChatMessages.filter(
        (m) => m.conversationId == currentChats.selectedConversationId
      );
      let lastMsg = maxBy(cb, (o) => o.id);
      lastId = (lastMsg && lastMsg.id) || 0;
    } else {
      lastId = chatPagination.lastId;
    }
    if (lastId > 0 || pagination) {
      let url = `ChatMessages/GetOlderMessages/${currentChats.selectedConversationId}?lastId=${lastId}&count=30`;
      setChatLoader(true);
      try {
        const res = await fetchHelper(url, {}, "GET", {
          Authorization: `Bearer ${token}`,
        });
        if (!has(res, "ErrorCode") && has(res, "data")) {
          setLiveChatMessages(
            unionBy([...liveChatRef.current], res.data, "id")
          );
          setChatPagination({ hasMore: res.hasMore, lastId: res.lastId });
        } else {
          Notify(
            "error",
            "Oops!",
            res.message || res.Message || "Something went wrong"
          );
        }
        setChatLoader(false);
      } catch (error) {
        console.log(error);
        setChatLoader(false);
      }
    }
  };

  const getTargetUserDetails = async () => {
    let url = `ChatMessages/GetTargetUserCard?id=${currentChats.targetUserId}`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        setTargetUserCard(res);
        if (
          router.asPath !== `/people/${res.userId}` &&
          router.asPath !== "/people/inbox"
        ) {
          router.push(`/people/${res.userId}`);
        }
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReceivedMsg = (msg) => {
    notifyTone.play();
    const message = msg;
    getChatSummary();
    if (ccRef?.current?.selectedConversationId == msg.conversationId) {
      //No need to show unread notification badge if chat is active and open now
      message.readDate = new Date();
    }
    setLiveChatMessages(liveChatRef.current.concat(message));
  };

  const sendChatMsg = async (msg = "", receiverId = "", attach = []) => {
    let url = `ChatMessages`;
    const data = {
      senderId: userData.id,
      receiverId:
        currentChats.targetUserId || receiverId || targetUserCard.userId,
      content: msg,
    };

    if (!isEmpty(attach)) {
      let chatAttachments = [];
      map(attach, (v) => {
        chatAttachments.push({
          attachmentId: v.id,
          chatMessageId: 0,
          id: 0,
        });
      });
      data.chatAttachments = chatAttachments;
    }

    if (isEmpty(attach) && isEmpty(msg.trim())) {
      return;
    }

    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        getChatSummary();
        if (isEmpty(ccRef.current.selectedConversationId)) {
          //Case when initial conversation for first time when conversation id will b empty
          setCurrentChats({
            ...currentChats,
            selectedConversationId: res.conversationId,
          });
        }
        setLiveChatMessages(liveChatMessages.concat(res));
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateLockSate = (unlockedObj) => {
    const oldData = cloneDeep(liveChatRef.current);
    const foundIndex = oldData.findIndex(
      (c) => c.id === unlockedObj.chatMessageId
    );
    if (foundIndex > -1) {
      const ca = oldData[foundIndex].chatAttachments.map((a) => {
        if (unlockedObj.attachmentId === a.attachmentId) {
          return unlockedObj;
        }
        return a;
      });
      let o = oldData[foundIndex];
      const newObj = {
        ...o,
        chatAttachments: ca,
      };
      oldData.splice(foundIndex, 1, newObj);
      setLiveChatMessages(oldData);
    }
  };

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, user-scalable=0"
        />
        <title>Find Hot Russian Girls on TrueBrides.com - Enjoy online dating with Russian and Ukrainian Brides!</title>
      </Head>
      <Affix offsetTop={0}>
        <Header className="header">
          <Col>
            <ChatContext.Provider
              value={{
                ...chatContextValue,
                allChats: liveChatRef.current,
              }}
            >
              <CHeader
                startOffset={startOffset}
                span={isLg && isChatOpen ? 23 : isLg ? 22 : span}
              />
            </ChatContext.Provider>
          </Col>
        </Header>
      </Affix>
      <Layout hasSider className={`layout ${isChatOpen && "content_xl_width"}`}>
        <Row
          style={{
            marginRight: "inherit",
            width: "100%",
          }}
        >
          <Col
            md={isChatOpen ? 12 : 24}
            lg={isChatOpen ? 13 : 17}
            xl={isChatOpen ? 13 : span}
            offset={startOffset}
            span={span}
            className={isChatOpen ? "content_col_" : null}
          >
            {isMobile && isChatOpen ? null : (
              <Content className="contentLayout">
                <ChatContext.Provider value={chatContextValue}>
                  <ContentData
                    startOffset={startOffset}
                    span={isChatOpen ? 12 : span}
                  />
                </ChatContext.Provider>
              </Content>
            )}
          </Col>
          {userProfile?.user?.userType === "Female" &&
          userProfile.verified !== true ? null : !isChatOpen ? null : (
            <Col xs={24} md={12} lg={8} xl={8} className="chatInboxCol">
              <ChatContext.Provider value={chatContextValue}>
                {mailOpen ? (
                  <MailBox
                    isReadOnly={!isEmpty(emailRead)}
                    openProfile={targetUserCard.userId}
                  />
                ) : (
                  <ChatBox
                    openProfile={targetUserCard.userId}
                    chatLoader={chatLoader}
                    chatPagination={chatPagination}
                    loadMoreChats={() => getFullConversation(true)}
                    data={chatsBetween}
                    onChatSend={(m, rcvId = "", attachment = []) =>
                      sendChatMsg(m, rcvId, attachment)
                    }
                    updateLockSate={updateLockSate}
                  />
                )}
              </ChatContext.Provider>
            </Col>
          )}
          {/* WHEN LARGER THEN MD SHOW SIDE CHAT */}
          {userProfile.user?.userType === "Female" &&
          userProfile?.verified !== true ? null : (
            <>
              {!["sm", "md", "xs"].includes(currentBP) ? (
                <Col
                  offset={startOffset}
                  span={3}
                  style={{ height: "calc(100vh - 90px)" }}
                  className={
                    isChatOpen ? "contactSiderCol_active" : "contactSiderCol"
                  }
                >
                  <div style={{ height: "fit-content" }}>
                    <Affix
                      style={{ height: "fit-content" }}
                      offsetTop={97}
                      className="contRelativeClass"
                    >
                      <ChatContext.Provider
                        value={{
                          ...chatContextValue,
                          allChats: liveChatRef.current,
                        }}
                      >
                        <Chat />
                      </ChatContext.Provider>
                    </Affix>
                  </div>
                  <div
                    className={
                      isChatOpen ? "openFixedClassContact" : "fixedClassContact"
                    }
                  >
                    <Affix
                      className={
                        isChatOpen
                          ? `rightZeroContact ${
                              contactActive && "rightZeroContact-active"
                            }`
                          : `myContactClass ${
                              contactActive && "myContactClass-active"
                            }`
                      }
                    >
                      <ChatContext.Provider value={chatContextValue}>
                        <MyContact isContactActive={contactActive} />
                      </ChatContext.Provider>
                    </Affix>
                  </div>
                </Col>
              ) : null}
            </>
          )}
        </Row>
      </Layout>
    </>
  );
}
