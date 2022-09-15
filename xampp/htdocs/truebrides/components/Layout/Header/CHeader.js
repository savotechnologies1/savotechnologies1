/* eslint-disable no-constant-condition */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Row,
  Col,
  Menu,
  Affix,
  Button,
  Popover,
  Avatar,
  Typography,
  Badge,
  Space,
  Divider,
  Empty,
  Spin,
  Modal,
} from "antd";
import { SearchOutlined, NotificationFilled } from "@ant-design/icons";
import { useRouter } from "next/router";
import { has, isEmpty } from "lodash-es";
import {
  UserOutlined,
  MailOutlined,
  MessageOutlined,
  BellOutlined,
  HeartFilled,
  HomeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import AuthActions from "@redux/reducers/auth/actions";
import {
  SearchModal,
  Payment,
  Chat,
  ChatContext,
  SettingsModal,
  Notify,
  Header,
  FAQmodal,
  StaticPageModal,
} from "@components";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import siteConfig from "@config/siteConfig";
import Images from "@config/images";
import "./CHeader.module.less";
import { useContext } from "react";
import Paragraph from "antd/lib/typography/Paragraph";
import { getNotiDateFormat, markNotiRead } from "@redux/utils/commonFunctions";
import fetchHelper from "@redux/utils/apiHelper";

const { Title, Link, Text } = Typography;
const {
  setMatchOptions,
  setSearchOptions,
  setUserData,
  setUserProfile,
  setResStatus,
  setBadgeCount,
  setAttachments,
  setChatSummary,
  setNotifications,
  setUserSettings,
  setTimezoneList,
  setAppSettings,
  setCountryList,
  setCityList,
} = AuthActions;

const CHeader = (props) => {
  const { span, startOffset } = props;
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, userData, userProfile, resStatus, badgeCount, notifications } =
    useSelector((state) => state.auth);
  const currentBP = useCurrentScreen();
  const cc = useContext(ChatContext);
  const { setChatOpen } = cc;

  //STATES
  const [popOverIndex, setPopOverIndex] = useState(""); //FOR SIGN IN MODAL
  const [profilePicturePath, setProfilePicturePath] = useState("");
  const [selectedMenuList, setSelectedMenuList] = useState([]);
  const [menuState, setMenuState] = useState(false); // Profile Menu
  const [searchMenuState, setSearchMenuState] = useState(false); // Search Menu
  const [chatMenuState, setChatMenuState] = useState(false); // Chat menu only in Mobile
  const [notiMenuState, setNotiMenuState] = useState(false); // Notification menu
  const [paymentModal, setPaymentModal] = useState(false);
  const [myCredits, setMyCredits] = useState(0);
  const [settingsModal, setSettingsModal] = useState(false);
  const [helpCenterModal, setHelpCenterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unReadChats, setUnreadChats] = useState(0); // Chat unread Count Badge for Mobile View
  const [termsModal, setTermsModal] = useState(false);

  //breakpoints conditions
  const showIcons = ["md", "sm", "xs"].includes(currentBP);
  const isMd = ["md"].includes(currentBP);
  const isTab = ["sm"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);
  const isLg = ["xl"].includes(currentBP);

  useEffect(() => {
    //This effect to to monitor the api response code if (402) open payment modal
    if (resStatus === 402) {
      //TODO: Handle Payment Modal
      setPaymentModal(true);
      dispatch(setResStatus(""));
    }
  }, [resStatus]);

  useEffect(() => {
    //This effect to update user's profile Picture
    const profilePhotoObj = userProfile?.user?.photos.filter(
      (photo) => photo.profilePicture
    );
    if (!isEmpty(profilePhotoObj)) {
      const newPath = `${siteConfig.imgUrl}${profilePhotoObj[0].photo.path}`;
      setProfilePicturePath(newPath);
    }
    const cred = userProfile?.user?.settings?.credit;
    setMyCredits(cred);
  }, [userProfile]);

  useEffect(() => {
    //This hook to close search Menu
    if (!searchMenuState) {
      updateActiveMenuState("1");
    }
  }, [searchMenuState]);

  useEffect(() => {
    //This hook to Chat Menu (mobile)
    if (!chatMenuState) {
      updateActiveMenuState("4");
    }
  }, [chatMenuState]);

  useEffect(() => {
    if (isEmpty(token)) {
      router.replace("/");
    }
  }, [token]);

  const updateActiveMenuState = (menuKey) => {
    const index = selectedMenuList.findIndex((item) => item === menuKey);
    if (index > -1) {
      selectedMenuList.splice(index, 1);
      setSelectedMenuList([...selectedMenuList]);
    }
  };

  const handleMenuSelection = ({ selectedKeys }) => {
    setSelectedMenuList(selectedKeys);
  };

  const logout = async () => {
    router.replace("/");
    dispatch(setUserData("", {}));
    dispatch(setUserProfile({}));
    dispatch(setUserSettings({}));
    dispatch(setTimezoneList({}));
    dispatch(setAppSettings({}));
    dispatch(setMatchOptions({}));
    dispatch(setSearchOptions([]));
    dispatch(setAttachments([]));
    dispatch(setChatSummary([]));
    dispatch(setCountryList([]));
    dispatch(setCityList([]));
    dispatch(
      setBadgeCount({
        inbox: 0,
        starred: 0,
        sent: 0,
        draft: 0,
        trash: 0,
      })
    );
  };

  const handleNavigation = (e, url) => {
    setMenuState(false);
    router.push(url);
    if (isTab || isMobile) {
      setChatOpen(false);
    }
  };

  const notiBadgeCount = useMemo(() => {
    let count = 0;
    !isEmpty(notifications) &&
      notifications.map((item) => {
        if (has(item, "readDate") && item.readDate === null) {
          count += 1;
        }
      });
    return count;
  });

  const handleNoti = async (item, e) => {
    markNotiRead(item);
    if (item.type === "Like") {
      e.preventDefault();
      if (router.asPath !== `/people/${item.payload.userId}`)
        router.push(`/people/${item.payload.userId}`);
      setNotiMenuState(false);
    } else if (item.type === "OrderStatusChange") {
      handleNavigation(e, `/people/presents`);
      setNotiMenuState(false);
    } else if (item.type === "DateRequestStatusChange") {
      handleNavigation(e, `/people/date-request`);
      setNotiMenuState(false);
    } else if (item.type === "ContactExchangeStatusChange") {
      handleNavigation(e, `/people/contact-exchange`);
      setNotiMenuState(false);
    }
  };

  const deleteNotification = async (n, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(n);

    let url = `SiteNotifications/${n.id}`;
    try {
      const res = await fetchHelper(url, {}, "DELETE", {
        Authorization: `Bearer ${token}`,
      });
      if (res && !has(res, "ErrorCode")) {
        let found = notifications.findIndex((o) => o.id == n.id);
        if (found >= 0) {
          let notiss = [...notifications];
          notiss.splice(found, 1);
          dispatch(setNotifications(notiss));
        }
        return;
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

  const deleteAllNoti = async () => {
    let url = `SiteNotifications/Clear`;
    setLoading(true);
    try {
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        dispatch(setNotifications([]));
        setNotiMenuState(false);
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const Loader = () => (
    <div
      span={24}
      style={{
        height: 200,
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spin spinning size="large" />
    </div>
  );

  const ProfileMenu = () => {
    return (
      <Affix
        offsetTop={isMd || isTab || isMobile ? 65 : 90}
        className="profileMenuAffix"
      >
        <Row className="profileMenuContainer">
          <Col span={24} className="profileColMb">
            {isMobile ? (
              <Link
                onClick={(e) => handleNavigation(e, `/people/my-profile`)}
                href={`/people/my-profile`}
                as={`/people/my-profile`}
                className="profileLinkBtn"
              >
                <a>
                  <Row justify="center" align="top">
                    <Title
                      level={4}
                      style={{ margin: 0 }}
                      className="name_text_class"
                      ellipsis={true}
                    >
                      {userProfile?.user?.name || ""}
                    </Title>
                  </Row>
                  {userData?.userType === "Male" && (
                    <Row justify="center" align="start">
                      <Text type="secondary" className="creditsText">
                        <img src={Images.diamondSVG} className="diamonSVG" />
                        {`${myCredits === 0 ? "No" : myCredits} Credits`}
                      </Text>
                    </Row>
                  )}
                </a>
              </Link>
            ) : null}

            <Row justify="center">
              <Button
                className={
                  router.asPath === `/people/my-profile`
                    ? "linkBtnsActive"
                    : "linkBtns"
                }
                href={`/people/my-profile`}
                as={`/people/my-profile`}
                type="text"
                onClick={(e) => {
                  handleNavigation(e, `/people/my-profile`);
                }}
                size="large"
              >
                My Profile
              </Button>
            </Row>
            <Row justify="center">
              <Button
                className={
                  router.asPath === `/people/presents`
                    ? "linkBtnsActive"
                    : "linkBtns"
                }
                type="text"
                onClick={(e) => handleNavigation(e, `/people/presents`)}
                size="large"
              >
                Gift Orders
              </Button>
            </Row>
            {isMobile ? (
              <Row justify="center">
                <Button
                  type="primary"
                  block
                  size="large"
                  className="credit_btn"
                  onClick={() => {
                    setMenuState(false);
                    setPaymentModal(true);
                  }}
                >
                  GET CREDITS
                </Button>
              </Row>
            ) : null}
            <Row justify="center">
              <Button
                className={
                  router.asPath === `/people/date-request`
                    ? "linkBtnsActive"
                    : "linkBtns"
                }
                type="text"
                onClick={(e) => handleNavigation(e, `/people/date-request`)}
                size="large"
              >
                Date Requests
              </Button>
            </Row>
            <Row justify="center">
              <Button
                className={
                  router.asPath === `/people/contact-exchange`
                    ? "linkBtnsActive"
                    : "linkBtns"
                }
                type="text"
                onClick={(e) => {
                  handleNavigation(e, `/people/contact-exchange`);
                }}
                size="large"
              >
                Contact Requests
              </Button>
            </Row>
            <Row justify="center">
              <Button
                type="text"
                className="linkBtns"
                onClick={() => {
                  setMenuState(false);
                  setSettingsModal(true);
                }}
                size="large"
              >
                Settings
              </Button>
            </Row>

            <Row justify="center">
              <Button
                type="text"
                onClick={() => {
                  setMenuState(false);
                  setHelpCenterModal(true);
                }}
                size="large"
              >
                Help Center
              </Button>
            </Row>
            <Row justify="center">
              <Button
                type="text"
                className="linkBtns"
                onClick={() => {
                  setMenuState(false);
                  setTermsModal(true);
                }}
                size="large"
              >
                Terms & Conditions
              </Button>
            </Row>
            <Row justify="center">
              <Button
                className={
                  router.asPath === `/` ? "linkBtnsActive" : "linkBtns"
                }
                type="text"
                onClick={() => logout()}
                size="large"
              >
                Sign Out
              </Button>
            </Row>
          </Col>
        </Row>
      </Affix>
    );
  };

  const NotificationMenu = () => {
    return (
      <Affix
        offsetTop={isMd || isTab || isMobile ? 65 : 90}
        className="notificationMenuAffix"
      >
        <Row align="center" className="notiMenuContainer noselect">
          {loading ? (
            <Loader />
          ) : (
            <>
              {notifications && notifications?.length > 0 ? (
                <Row justify="end" className="delete_noti_row">
                  <Button
                    type="link"
                    className="deleteall_btn"
                    onClick={() => deleteAllNoti()}
                  >
                    Clear All
                  </Button>
                </Row>
              ) : null}
              <Space
                direction="vertical"
                className="space_div_class"
                style={{
                  width: "100%",
                  paddingBottom: 5,
                  paddingTop:
                    notifications && notifications?.length > 0 ? 40 : 0,
                }}
                split={<Divider type="horizontal" className="menuSeperator" />}
              >
                {!isEmpty(notifications) &&
                  notifications.map((item, index) => {
                    return (
                      <Col span={24} key={index}>
                        <Row
                          onClick={(e) => handleNoti(item, e)}
                          className={`notificationItem ${
                            !item.readDate && "notificationItem-unread"
                          }`}
                          wrap={false}
                        >
                          <div
                            onClick={(e) => deleteNotification(item, e)}
                            className="notiRemoveBtn"
                          >
                            <DeleteOutlined />
                          </div>
                          <Col flex="60px">
                            <Badge dot={!item.readDate}>
                              <Avatar
                                style={{
                                  backgroundColor: "#e9aeae",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  marginTop: 5,
                                }}
                                src={
                                  [
                                    "Like",
                                    "ContactExchangeStatusChange",
                                    "DateRequestStatusChange",
                                    "OrderStatusChange",
                                  ].includes(item.type) ? (
                                    `${siteConfig.imgUrl}${item.payload.picturePath}`
                                  ) : item.type === "News" ? (
                                    <NotificationFilled className="heartAvatar" />
                                  ) : (
                                    <HeartFilled className="heartAvatar" />
                                  )
                                }
                                size={45}
                              />
                            </Badge>
                          </Col>
                          <Col flex="auto">
                            <Row className="title_body_class">
                              <Paragraph
                                strong
                                ellipsis={{ rows: 1 }}
                                className="m-0"
                              >
                                {item.title}
                              </Paragraph>
                              <Paragraph ellipsis={{ rows: 2 }} className="m-0">
                                {item.body}
                              </Paragraph>
                            </Row>
                            <Row>
                              <Text type="secondary">
                                {getNotiDateFormat(item.createDate)}
                              </Text>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    );
                  })}
                {isEmpty(notifications) && (
                  <Col span={24} className="notiColClass">
                    <Empty description="No Notifications!" />
                  </Col>
                )}
              </Space>
            </>
          )}
        </Row>
      </Affix>
    );
  };

  return (
    <Row className="hContainer noselect" align="middle">
      <Col
        offset={startOffset}
        span={
          isMd && cc.isChatOpen
            ? 24
            : isLg && cc.isChatOpen
            ? 23
            : isLg
            ? 22
            : span
        }
      >
        <Row>
          <>
            {!isMobile ? (
              isTab || showIcons ? (
                <Col
                  onClick={(e) => handleNavigation(e, "/people")}
                  flex="80px"
                  className="colStyle justifyStart"
                >
                  <Link
                    href="/people"
                    className="colStyle justifyStart"
                    onClick={(e) => e.preventDefault()}
                  >
                    <HeartFilled className="heartIcon" />
                  </Link>
                </Col>
              ) : (
                <Col
                  flex="150px"
                  onClick={(e) => handleNavigation(e, "/people")}
                  className="colStyle justifyStart"
                >
                  <Link
                    href="/people"
                    className="colStyle justifyStart"
                    onClick={(e) => e.preventDefault()}
                  >
                    <HeartFilled className="heartIcon" />
                    <Text className="headerTitlePeoplePage">TrueBrides</Text>
                  </Link>
                </Col>
              )
            ) : null}
            <Col flex="auto" className="colStyle justifyEnd">
              <Menu
                selectable
                mode="horizontal"
                className="headerMenu"
                onSelect={handleMenuSelection}
                onDeselect={handleMenuSelection}
                defaultSelectedKeys={["6"]}
              >
                {isMobile ? (
                  <Menu.Item key="6">
                    <HomeOutlined
                      className="iconBtns"
                      onClick={(e) => {
                        if (isMobile) {
                          setChatOpen(false);
                        }
                        e.preventDefault();
                        handleNavigation(e, "/people");
                      }}
                    />
                  </Menu.Item>
                ) : null}
                <Menu.Item key="1">
                  {isMobile || isMd ? (
                    <>
                      <div
                        className="menusTextContainer"
                        onClick={(v) => setSearchMenuState(v)}
                      >
                        {showIcons ? (
                          <SearchOutlined className="iconBtns" />
                        ) : (
                          "SEARCH"
                        )}
                      </div>
                      <Modal
                        visible={searchMenuState}
                        footer={null}
                        zIndex={10}
                        closable={false}
                        className="chatMobileClass"
                        onCancel={() => setSearchMenuState(false)}
                        maskStyle={{ backgroundColor: "transparent" }}
                      >
                        <SearchModal
                          dismiss={() => setSearchMenuState(false)}
                        />
                      </Modal>
                    </>
                  ) : (
                    <Popover
                      content={
                        <SearchModal
                          dismiss={() => setSearchMenuState(false)}
                        />
                      }
                      trigger="click"
                      overlayClassName="chat_pop_class"
                      placement="bottom"
                      visible={searchMenuState}
                      onVisibleChange={(v) => setSearchMenuState(v)}
                    >
                      <div className="menusTextContainer">
                        {showIcons ? (
                          <SearchOutlined className="iconBtns" />
                        ) : (
                          "SEARCH"
                        )}
                      </div>
                    </Popover>
                  )}
                </Menu.Item>
                {showIcons ? (
                  <Menu.Item key="4">
                    <div
                      className="menusTextContainer"
                      onClick={() => setChatMenuState(!chatMenuState)}
                    >
                      <Badge
                        overflowCount={9}
                        count={unReadChats || 0}
                        offset={[showIcons ? 0 : 8, 0]}
                        size="small"
                      >
                        <MessageOutlined className="iconBtns" />
                      </Badge>
                    </div>
                    <Modal
                      visible={chatMenuState}
                      footer={null}
                      zIndex={10}
                      closable={false}
                      className="chatMobileClass"
                      onCancel={() => setChatMenuState(false)}
                      maskStyle={{ backgroundColor: "transparent" }}
                    >
                      <Chat
                        dismiss={() => setChatMenuState(false)}
                        setUnreadChats={(c) => setUnreadChats(c)}
                      />
                    </Modal>
                  </Menu.Item>
                ) : null}
                <Menu.Item
                  key="2"
                  onClick={(e) => handleNavigation(e, "/people/inbox")}
                >
                  <div className="menusTextContainer">
                    <Badge
                      count={badgeCount?.inbox || 0}
                      offset={[showIcons ? 0 : 8, 0]}
                      size="small"
                      className="badgeCountClass"
                    >
                      {showIcons ? (
                        <MailOutlined className="iconBtns" />
                      ) : (
                        "MAILBOX"
                      )}
                    </Badge>
                  </div>
                </Menu.Item>
                {showIcons ? (
                  <Menu.Item key="5">
                    <div
                      className="menusTextContainer"
                      onClick={(visible) => setNotiMenuState(visible)}
                    >
                      <BellOutlined className="iconBtns" />
                    </div>
                    <Modal
                      visible={notiMenuState}
                      footer={null}
                      zIndex={10}
                      closable={false}
                      className="chatMobileClass"
                      onCancel={() => setNotiMenuState(false)}
                      maskStyle={{ backgroundColor: "transparent" }}
                    >
                      <NotificationMenu />
                    </Modal>
                  </Menu.Item>
                ) : null}
                {!["sm", "xs"].includes(currentBP) ? (
                  <span key="3" className="navBarBtnContainer">
                    <Button
                      type="primary"
                      block
                      size="middle"
                      className="navbarBtn"
                      onClick={() => setPaymentModal(true)}
                    >
                      GET CREDITS
                    </Button>
                  </span>
                ) : null}
                <div style={{ height: "100%" }}>
                  {isMobile || isMd ? (
                    <>
                      <Row
                        onClick={(visible) => setMenuState(visible)}
                        className="menuIconContainer"
                        justify="center"
                        align="middle"
                      >
                        <Col>
                          <Avatar
                            size={isTab || isMobile ? 40 : 50}
                            icon={<UserOutlined />}
                            src={profilePicturePath}
                          />
                        </Col>
                        <Col className="profileNameContainer">
                          <Title className="profileBtnName" ellipsis={true}>
                            {userProfile?.user?.name}
                          </Title>
                          {userData?.userType === "Male" && (
                            <Text type="secondary" className="creditsText">
                              <img
                                src={Images.diamondSVG}
                                className="diamonSVG"
                              />
                              {`${myCredits === 0 ? "No" : myCredits} Credits`}
                            </Text>
                          )}
                        </Col>
                      </Row>
                      <Modal
                        visible={menuState}
                        footer={null}
                        zIndex={10}
                        closable={false}
                        className="profileClickPopOver"
                        onCancel={() => setMenuState(false)}
                        maskStyle={{ backgroundColor: "transparent" }}
                      >
                        <ProfileMenu />
                      </Modal>
                    </>
                  ) : (
                    <Popover
                      overlayClassName="profile_clickPopOver"
                      content={ProfileMenu}
                      trigger="click"
                      placement="bottomRight"
                      visible={menuState}
                      onVisibleChange={(visible) => setMenuState(visible)}
                    >
                      <Row
                        className="menuIconContainer"
                        justify="center"
                        align="middle"
                      >
                        <Col>
                          <Avatar
                            size={isTab || isMobile ? 40 : 50}
                            icon={<UserOutlined />}
                            src={profilePicturePath}
                          />
                        </Col>
                        <Col className="profileNameContainer">
                          <Title className="profileBtnName" ellipsis={true}>
                            {userProfile?.user?.name}
                          </Title>
                          {userData?.userType === "Male" && (
                            <Text type="secondary" className="creditsText">
                              <img
                                src={Images.diamondSVG}
                                className="diamonSVG"
                              />
                              {`${myCredits === 0 ? "No" : myCredits} Credits`}
                            </Text>
                          )}
                        </Col>
                      </Row>
                    </Popover>
                  )}
                </div>
                {!showIcons ? (
                  <div style={{ height: "100%" }}>
                    <Popover
                      overlayClassName="gallery_clickPopOver"
                      content={NotificationMenu}
                      trigger="click"
                      placement="bottomRight"
                      visible={notiMenuState}
                      onVisibleChange={(visible) => setNotiMenuState(visible)}
                    >
                      <Row
                        className={`notiIconContainer ${
                          notiMenuState && "notiIconContainer-active"
                        }`}
                        justify="center"
                        align="middle"
                      >
                        <Badge count={notiBadgeCount}>
                          <BellOutlined className="iconBtns" />
                        </Badge>
                      </Row>
                    </Popover>
                  </div>
                ) : null}
              </Menu>
            </Col>
          </>
        </Row>
      </Col>
      <Header
        onlyModal={true}
        pIndex={popOverIndex}
        onIndexChange={(i) => {
          setPopOverIndex(i);
        }}
      />
      <SettingsModal
        visible={settingsModal}
        dismiss={() => setSettingsModal(false)}
      />
      <FAQmodal
        visible={helpCenterModal}
        dismiss={() => setHelpCenterModal(false)}
      />
      <StaticPageModal
        visible={termsModal}
        dismiss={() => setTermsModal(false)}
        type="terms"
      />
      {paymentModal && (
        <Payment
          visible={paymentModal}
          dismiss={() => setPaymentModal(false)}
        />
      )}
    </Row>
  );
};

export default CHeader;
