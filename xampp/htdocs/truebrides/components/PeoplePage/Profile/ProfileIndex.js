import React, { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  Layout,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Input,
  Affix,
  Popover,
  Empty,
  Tooltip,
} from "antd";
import {
  Cover,
  AddPhotos,
  MyInterests,
  AboutMe,
  LookingFor,
  AffixPopMenuData,
  Gifts,
  BioModal,
  NameEdit,
  DateRequestModal,
  ContactExchnage,
  Notify,
  ChatContext,
  ShopModal,
} from "@components";
import {
  EditOutlined,
  MessageOutlined,
  MailOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import Images from "@config/images";
import siteConfig from "@config/siteConfig";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import fetchHelper from "@redux/utils/apiHelper";
import { has, isArray, isEmpty, size, truncate } from "lodash";
import {
  getConversationId,
  getMyProfileData,
} from "@redux/utils/commonFunctions";
import Link from "next/link";
import "./ProfileIndex.module.less";

const { Text, Paragraph, Title } = Typography;

export default function ProfileIndex(props) {
  const { span, startOffset } = props;
  const cc = useContext(ChatContext);
  const router = useRouter();
  const {
    query: { index },
  } = router;
  const { token, userData, peopleList, userProfile, notifications } =
    useSelector((state) => state.auth);
  const [bioModal, setBioModal] = useState(false);
  const [nameEditModal, setNameEditModal] = useState(false);
  const currentBP = useCurrentScreen();
  const isMedium = ["lg"].includes(currentBP);
  const isSmall = ["sm"].includes(currentBP);
  const isTab = ["md"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);
  const isOpen = ["xs", "sm", "md", "lg"].includes(currentBP);
  const [isStickey, setIsStickey] = useState(false); // Name section
  const [siderUnAffix, setSiderUnAfix] = useState(false); // left Col
  // Main Data
  const [pageLoader, setPageLoader] = useState(true);
  const [relatedLoader, setRelatedLoader] = useState(true);
  const [relatedProfiles, setRelatedProfiles] = useState([]);
  const [allData, setAllData] = useState({});
  const [profilePic, setProfilePic] = useState("");
  const [coverPic, setCoverPic] = useState("");
  const [photoList, setPhotoList] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [ellipsis, setEllipsis] = useState(true);
  const [popVisible, setPopVisible] = useState(false);
  const [chatInput, setChatInput] = useState(""); //Input Msg for chat
  const [openGiftShop, setOpenGiftShop] = useState(false); //Open Gift Shop Modal

  const isOnline = allData?.user?.online || false;
  const isVerified = allData?.verified || false;
  const AmIFemale = userData?.userType === "Female";
  const biography = allData?.biography;
  const len = size(biography);

  const [dateModal, setDateModal] = useState(false);
  const [exchangeModal, setExchangeModal] = useState(false);
  const [havePrivateAccess, setHavePrivateAccess] = useState(false); // Should Allow to see private images
  const [eligible, setEligible] = useState(""); // For Contact Exchange Props
  const [status, setStatus] = useState(""); // For Contact Exchange Props
  const [dateRes, setDateRes] = useState(""); // For date Props

  const leftSiderRef = useRef(null);
  const rightSiderRef = useRef(null);

  useEffect(() => {
    initialCall();
    setIsStickey(false); // When other profile opens the stickey state is not reseted by default. So we need to do it manually
  }, [router.query]);

  useEffect(() => {
    // console.log("All Data ==>", allData);
    if (!isEmpty(allData)) {
      //! Settting if the Profile details are editable or static
      if (allData.userId == userProfile.userId) {
        setIsEditable(true);
      } else {
        setIsEditable(false);
      }
      //! Setting Profile Picture
      const pp = allData?.user?.photos.find((it) => it.profilePicture);
      if (pp?.photo?.path) {
        setProfilePic(`${siteConfig.imgUrl}${pp.photo.path}`);
      } else {
        setProfilePic(`${siteConfig.imgUrl}images/blank-profile-picture.png`);
      }
      //! Update List of Photos
      if (allData?.user?.photos) {
        setPhotoList(
          allData.user.photos.sort((a, b) => (a.photoId < b.photoId ? 1 : -1))
        );
      }
      //! initial Calls For setting Contact Exchange / Date Requests
      if (userData?.userType === "Male") {
        getReqStatus();
      }
      //! Check if allow to see others private images
      checkEligibilityForPrivatePhotos();
    }
  }, [allData]);

  useEffect(() => {
    //! Setting Cover Picture
    const cp = allData?.user?.covers;
    if (!isEmpty(cp) && cp[0]?.photo?.path) {
      setCoverPic(`${siteConfig.imgUrl}${cp[0]?.photo?.path}`);
    } else {
      setCoverPic(Images.coverImg);
    }
  }, [allData, coverPic]);

  const onUpdateData = async () => {
    let url = `${userData?.userType}s/WithUserId/${userData?.id}`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        refreshWithNewData();
        const cp = res?.user?.covers;
        setCoverPic(`${siteConfig.imgUrl}${cp[0]?.photo?.path}`);
        setAllData(res);
      } else {
        Notify("error", "Oops!", "Something went wrong");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    //For left Sider to be stickey until bottom end of photos is reached
    const handleSticky = () => {
      if (rightSiderRef?.current) {
        if (
          window.scrollY >
          rightSiderRef.current.offsetTop -
            leftSiderRef?.current?.offsetTop -
            45
        ) {
          setSiderUnAfix(true);
        } else {
          setSiderUnAfix(false);
        }
      }
    };

    window.addEventListener("scroll", handleSticky);
    return () => window.removeEventListener("scroll", handleSticky);
  }, []);

  const initialCall = () => {
    let thisProfile = -1;
    if (!isEmpty(peopleList)) {
      thisProfile = peopleList.findIndex((it) => it.id == index[0]);
    }
    if (index[0] == "my-profile") {
      //! Check if clicked profile is of user's self profile
      setAllData(userProfile);
      setPageLoader(false);
      getData(true, false, true); // default option - refresh = false, noData = true, self = false
    } else if (thisProfile < 0) {
      //! Data not present in redux call api for profile details
      getData();
      getRelatedProfiles();
    } else {
      //! got the profile index in redux list
      setAllData(peopleList[thisProfile]);
      setPageLoader(false);
      getData(true, false); // default option - refresh = false, noData = true, self = false
      getRelatedProfiles();
    }
  };

  useEffect(() => {
    if (userData?.userType === "Male") {
      getReqStatus();
    }
  }, [notifications]);

  const getData = async (refresh = false, noData = true, self = false) => {
    let url = `${
      userData?.userType === "Male" ? "Females" : "Males"
    }/WithUserId/${index[0]}`;
    if (self) {
      url = `${userData?.userType}s/WithUserId/${userData?.id}`;
    }
    if (!refresh) {
      setPageLoader(true);
    }
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        setAllData(res);

        setPageLoader(false);
      } else {
        if (noData) setAllData([]);
        setPageLoader(false);
      }
    } catch (error) {
      setPageLoader(false);
      console.log(error);
    }
  };

  const getRelatedProfiles = async () => {
    let url = `Users/${index[0]}/Related`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        setRelatedProfiles(res);
      }
      setRelatedLoader(false);
    } catch (error) {
      setRelatedLoader(false);
      console.log(error);
    }
  };

  const refreshWithNewData = async (type = false) => {
    //If type = true, not to update selected profile data with my profile data..
    const fullProfileDetails = await getMyProfileData();
    if (!type) {
      setAllData(fullProfileDetails);
    }
  };

  const getReqStatus = () => {
    checkEligibility();
    lastExchangeRequest();
    lastDateRequest();
  };

  const checkEligibility = async () => {
    let url = `ContactExchanges/CheckEligible?femaleId=${allData?.userId}`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      setEligible(res);
    } catch (error) {
      console.log(error);
    }
  };

  const checkEligibilityForPrivatePhotos = async () => {
    let url = `PhotoUsers/CheckEligible?targetUserId=${allData?.userId}`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (res) {
        setHavePrivateAccess(true);
      } else {
        setHavePrivateAccess(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const lastExchangeRequest = async () => {
    let url = `ContactExchanges/Last?femaleId=${allData?.userId}`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        setStatus(res.status);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const lastDateRequest = async () => {
    let url = `DateRequests/Last?femaleId=${allData?.userId}`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode") && !isEmpty(res)) {
        setDateRes(res);
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const chatOrEmail = (e, type = "mail", id) => {
    const ID = id || allData.userId;
    e.preventDefault();
    cc.openChatFor({
      targetUserId: ID,
      selectedConversationId: getConversationId(ID),
    });
    if (type === "chat") {
      // handle Chat
      cc.setChatOpen();
    } else {
      //handle mail
      cc.setMailOpen(true);
    }
  };

  const handleMsgSend = (e) => {
    chatOrEmail(e, "chat");
    if (!isEmpty(chatInput.trim())) {
      cc.onChatSend(chatInput, allData?.userId);
      setChatInput("");
    }
  };

  const renderRelatedProfiles = () => {
    if (
      isArray(relatedProfiles) &&
      !isEmpty(relatedProfiles) &&
      !has(relatedProfiles, "ErrorCode")
    ) {
      return (
        <>
          <span ref={rightSiderRef} style={{ height: 1, width: 1 }} />
          <Row align="middle" gutter={[16, 16]} className="profile_row_class">
            <Col span={24} className="relatedTitle">
              See more like {allData?.user?.name}
            </Col>
            <Row
              wrap={false}
              gutter={[8, 16]}
              className={
                cc?.isChatOpen ? "relatedSlider_open" : "relatedSlider"
              }
            >
              {relatedProfiles.map((p, k) => {
                if (
                  isMedium ? k > 3 : isTab ? k > 2 : isMobile ? k > 1 : k > 4
                ) {
                  return;
                }
                return (
                  <Col
                    xs={12}
                    sm={8}
                    md={4}
                    key={k}
                    className={
                      cc.isChatOpen
                        ? "open_relatedProfileContainer"
                        : "relatedProfileContainer"
                    }
                  >
                    <Link href={`/people/${p.id}`}>
                      <a className="a_container">
                        <div className="relatedProfileImgContainer">
                          <img
                            src={`${siteConfig.imgUrl}${p.picturePath}`}
                            className="relatedProfileImg"
                            onError={(e) => {
                              e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                            }}
                          />
                          <div
                            className={
                              p.online === true && !cc.isChatOpen
                                ? "relatedOnlineIcon"
                                : cc.isChatOpen && p.online === true
                                ? " open_relatedOnlineIcon"
                                : cc.isChatOpen && p.online !== true
                                ? "open_offline_relatedOnlineIcon"
                                : "related_offlineIcon"
                            }
                          />
                        </div>
                        <div
                          className={
                            cc.isChatOpen
                              ? "smaill_nameContainer"
                              : "nameContainer"
                          }
                        >
                          <Row
                            className={
                              cc.isChatOpen
                                ? "small_relatedNameRow"
                                : "relatedNameRow"
                            }
                          >
                            <txt className="name">{p.name}</txt>
                            <span className="age">,&nbsp;{p.age}</span>
                          </Row>
                        </div>
                      </a>
                    </Link>
                    <Button
                      className={
                        cc.isChatOpen && p.online
                          ? "small_related_chat_btn"
                          : !cc.isChatOpen && p.online
                          ? "related_chat_btn"
                          : cc.isChatOpen && !p.online
                          ? "small_related_email_btn"
                          : "related_email_btn"
                      }
                      icon={p.online ? <MessageOutlined /> : <MailOutlined />}
                      type="primary"
                      size={currentBP === "xs" ? "small" : "middle"}
                      onClick={(e) =>
                        chatOrEmail(e, p.online ? "chat" : "email", p.id)
                      }
                    >
                      {cc.isChatOpen && isOpen
                        ? null
                        : p.online
                        ? "Chat Now"
                        : "Send Email"}
                    </Button>
                  </Col>
                );
              })}
            </Row>
          </Row>
        </>
      );
    }
    return <></>;
  };

  const renderAffix = () => {
    return (
      <>
        {isStickey ? (
          <Col
            className="CoverstickeyRow"
            offset={startOffset}
            lg={cc?.isChatOpen ? 10 : span}
            xl={cc?.isChatOpen ? 13 : span}
          >
            <div className="CoverstickeyDiv">
              <img src={profilePic} className="avatarStickeyCover" />
              <div className="affix_name_icon_div">
                <Text
                  ellipsis={true}
                  className={
                    cc.isChatOpen ? "chatOpen_text" : "coverUserNameTxt"
                  }
                >
                  {allData?.user?.name}, {allData.age}
                </Text>
                <span className="span_verify">
                  {isVerified ? (
                    <Tooltip
                      placement="topRight"
                      title="This user is a verified user"
                    >
                      <img
                        src={Images.verifiedSVG}
                        className={
                          cc.isChatOpen
                            ? "mini_height"
                            : "verfiedLogo logoHeight"
                        }
                      />
                    </Tooltip>
                  ) : null}
                </span>
              </div>
            </div>
            {isEditable ? null : (
              <Row className="affixProfileHead">
                {isMobile || !isOnline || cc?.isChatOpen ? (
                  <>
                    {isOnline ? (
                      <Button
                        icon={<MessageOutlined />}
                        type="primary"
                        className="affifHeadbtn"
                        onClick={(e) => chatOrEmail(e, "chat")}
                      >
                        CHAT NOW
                      </Button>
                    ) : null}
                  </>
                ) : (
                  <Button
                    icon={<MessageOutlined />}
                    type="primary"
                    className="affifHeadbtn"
                    onClick={(e) => chatOrEmail(e, "chat")}
                  >
                    CHAT NOW
                  </Button>
                )}
                {isMobile ? (
                  <Button
                    className="affifHeadbtnWhite"
                    icon={<MailOutlined />}
                    onClick={(e) => chatOrEmail(e, "mail")}
                  >
                    {isOnline ? "" : "SEND EMAIL"}
                  </Button>
                ) : (
                  <Button
                    className="affifHeadbtnWhite"
                    icon={
                      <MailOutlined className={isOnline ? "only_icon" : null} />
                    }
                    onClick={(e) => chatOrEmail(e, "mail")}
                  >
                    {isOnline ? "" : "SEND EMAIL"}
                  </Button>
                )}
                <Row className="RowPopAffix">
                  <Col>
                    <Popover
                      overlayClassName="gallery_clickPopOver"
                      visible={popVisible}
                      onVisibleChange={(v) => setPopVisible(v)}
                      autoAdjustOverflow={false}
                      trigger="click"
                      placement="bottom"
                      content={
                        <AffixPopMenuData
                          onSendGift={() => setOpenGiftShop(true)}
                          onContactExchange={() => setExchangeModal(true)}
                          onDateRequest={() => setDateModal(true)}
                          femaleId={allData?.userId}
                          email={allData?.user?.email}
                          online={isOnline}
                          onModalClose={() => setPopVisible(false)}
                          verified={isVerified}
                          userId={allData?.userId}
                        />
                      }
                      style={{ top: 10 }}
                    >
                      {AmIFemale || !isVerified ? null : (
                        <Button
                          shape="round"
                          icon={<EllipsisOutlined />}
                          className="moreBtn"
                        />
                      )}
                    </Popover>
                  </Col>
                </Row>
              </Row>
            )}
          </Col>
        ) : (
          <>
            <div className="nameiconDiv">
              <Text className="userNameText">
                {allData?.user?.name}, {allData.age}{" "}
                {isVerified ? (
                  <Tooltip
                    placement="topRight"
                    title="This user is a verified user"
                  >
                    <img
                      src={Images.verifiedSVG}
                      className="verfiedLogo logoHeight"
                    />
                  </Tooltip>
                ) : null}
                {isEditable ? (
                  <span
                    className="roundCircleSpan"
                    onClick={() => setNameEditModal(true)}
                  >
                    <EditOutlined className="editIcon" />
                  </span>
                ) : null}
              </Text>
            </div>
            <Row className="coverBioRow">
              {isEditable ? (
                <>
                  <Button
                    type="link"
                    className="myselfText"
                    onClick={() => setBioModal(true)}
                  >
                    {isEmpty(allData?.biography)
                      ? "Add More About Yourself"
                      : allData?.biography}
                  </Button>
                  <div>
                    <span
                      className="roundCircleSpan"
                      onClick={() => setBioModal(true)}
                    >
                      <EditOutlined className="editIcon" />
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Col
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Paragraph
                      type="secondary"
                      className="moreText"
                      onClick={() => setEllipsis(!ellipsis)}
                    >
                      {truncate(biography, {
                        length: ellipsis ? 100 : 500,
                        omission: "...",
                      })}
                      {len > 100 ? (
                        <Text
                          type="danger"
                          onClick={() => setEllipsis(!ellipsis)}
                          className="continueLessText"
                        >
                          {ellipsis ? "Read more" : "  Read Less"}
                        </Text>
                      ) : len === 0 ? (
                        <Text className="askAboutText">
                          Ask {allData?.user?.name} about{" "}
                          {!AmIFemale ? "herself" : "himself"}
                        </Text>
                      ) : null}
                    </Paragraph>
                  </Col>
                </>
              )}
            </Row>
            {isEditable || !isOnline ? null : (
              <Row className="chatBtnRow">
                <Col span={24} className="chatBtnCol">
                  {isMobile && !cc?.isChatOpen ? (
                    <>
                      <Button
                        className="chatBtnMobile"
                        icon={<MessageOutlined className="chatIcon" />}
                        onClick={(e) => chatOrEmail(e, "chat")}
                      >
                        CHAT NOW
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        placeholder="Type your message here..."
                        className={
                          cc.isChatOpen ? "chat_input_chatOpen" : "chatinput"
                        }
                        value={chatInput}
                        onKeyDown={(e) => e.keyCode == 13 && handleMsgSend(e)}
                        onChange={(e) => setChatInput(e.target.value)}
                      />
                      <Button
                        className={cc.isChatOpen ? "chat_oprn_btn" : "chatBtn"}
                        icon={<MessageOutlined className="chatIcon" />}
                        onClick={(e) => handleMsgSend(e)}
                      >
                        CHAT NOW
                      </Button>
                    </>
                  )}
                </Col>
              </Row>
            )}
            {isEditable ? null : (
              <Row className="giftsRow">
                <Col span={24}>
                  <Gifts
                    onSendGift={() => setOpenGiftShop(true)}
                    onContactExchange={() => setExchangeModal(true)}
                    onDateRequest={() => setDateModal(true)}
                    femaleId={allData?.userId}
                    verified={isVerified}
                    email={allData?.user?.email}
                    userId={allData?.userId}
                  />
                </Col>
              </Row>
            )}
          </>
        )}
      </>
    );
  };

  if (pageLoader) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 70px)",
          width: "100%",
        }}
      >
        <img src={Images.loadingHearts} width="100px" />
      </div>
    );
  }

  if (isEmpty(allData)) {
    return (
      <Col span={24} className="NoDataView">
        <Empty
          description={<Title level={5}>The user does not exist!</Title>}
        />
      </Col>
    );
  }

  return (
    <>
      <div>
        <Layout className="layoutCover">
          <Row
            className="coverimg"
            style={{ backgroundImage: `url(${coverPic})` }}
          >
            <Col className="coverCol" span={24}>
              <Cover
                data={allData}
                editable={isEditable}
                profilePicPath={profilePic}
                onUpdate={() => onUpdateData()}
                onUploadSuccess={(type = false) => refreshWithNewData(type)}
              />
            </Col>
          </Row>
          <Row justify="center">
            <div className="coverUserNameDiv">
              <Row
                justify="space-between"
                className={
                  cc?.isChatOpen
                    ? "coverUserNameRow_Chatopen"
                    : "coverUserNameRow"
                }
              >
                <Col
                  xs={{ span: 21 }}
                  md={{ span: 21 }}
                  lg={{ span: 20 }}
                  xl={{ span: 16 }}
                  className={cc?.isChatOpen ? "full_w_giftcol" : "giftCol"}
                >
                  <Affix
                    className="affix_profile_"
                    offsetTop={isSmall || isMobile ? 63 : 87}
                    onChange={(s) => setIsStickey(s)}
                  >
                    {renderAffix()}
                  </Affix>
                </Col>
              </Row>
            </div>
          </Row>
        </Layout>
        <Row>
          <Col
            className="coverLeftSideCol"
            xs={{ span: 24 }}
            sm={{ span: 7 }}
            md={{ span: cc?.isChatOpen ? 24 : 7 }}
            lg={{ span: cc?.isChatOpen ? 24 : 6 }}
            xl={{ span: 6 }}
          >
            {isMobile ? (
              <>
                <AboutMe
                  editable={isEditable}
                  data={allData}
                  onUpdate={() => refreshWithNewData()}
                />
                <LookingFor
                  editable={isEditable}
                  data={allData}
                  onUpdate={() => refreshWithNewData()}
                />
                <MyInterests
                  editable={isEditable}
                  data={allData}
                  onUpdate={() => refreshWithNewData()}
                />
              </>
            ) : (
              <>
                {(isMedium && cc?.isChatOpen) || (isTab && cc?.isChatOpen) ? (
                  <>
                    <AboutMe
                      editable={isEditable}
                      data={allData}
                      onUpdate={() => refreshWithNewData()}
                    />
                    <LookingFor
                      editable={isEditable}
                      data={allData}
                      onUpdate={() => refreshWithNewData()}
                    />
                    <MyInterests
                      editable={isEditable}
                      data={allData}
                      onUpdate={() => refreshWithNewData()}
                    />
                  </>
                ) : (
                  <Affix
                    className={`aboutmeSider ${siderUnAffix && "siderUnAffix"}`}
                    offsetTop={isTab ? 130 : 155}
                  >
                    <AboutMe
                      editable={isEditable}
                      data={allData}
                      onUpdate={() => refreshWithNewData()}
                    />
                    <LookingFor
                      editable={isEditable}
                      data={allData}
                      onUpdate={() => refreshWithNewData()}
                    />
                    <MyInterests
                      editable={isEditable}
                      data={allData}
                      onUpdate={() => refreshWithNewData()}
                    />
                    <span ref={leftSiderRef} style={{ height: 1, width: 1 }} />
                  </Affix>
                )}
              </>
            )}
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 17 }}
            md={{ span: cc?.isChatOpen ? 24 : 17 }}
            lg={{ span: cc?.isChatOpen ? 24 : 18 }}
            xl={{ span: 18 }}
          >
            <AddPhotos
              canSeePrivate={havePrivateAccess}
              withUpload={isEditable}
              photoList={photoList}
              onUploadSuccess={() => refreshWithNewData()}
            />
          </Col>
        </Row>
      </div>
      <div>{renderRelatedProfiles()}</div>
      <div>
        <Row justify="center" align="middle">
          <Col span={24} className="textForCopyRight">
            <Text type="secondary">
              Copyright © 2021 TrueBrides. All rights reserved.
            </Text>
          </Col>
        </Row>
      </div>
      <Modal
        visible={bioModal}
        footer={null}
        zIndex={10}
        onCancel={() => setBioModal(false)}
        className="the_new_class"
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <BioModal
          biography={allData?.biography}
          dismiss={(status = false) => {
            setBioModal(false);
            if (status) {
              refreshWithNewData();
            }
          }}
        />
      </Modal>
      <Modal
        visible={nameEditModal}
        footer={null}
        zIndex={10}
        onCancel={() => setNameEditModal(false)}
        className="the_new_class"
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <NameEdit
          name={allData?.user?.name}
          birthdate={allData?.dateOfBirth}
          dismiss={(status = false) => {
            setNameEditModal(false);
            if (status) {
              refreshWithNewData();
            }
          }}
        />
      </Modal>
      <Modal
        visible={exchangeModal}
        footer={null}
        zIndex={10}
        onCancel={() => setExchangeModal(false)}
        className="contactModal"
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <ContactExchnage
          email={allData?.user?.email}
          eligible={eligible}
          status={status}
          femaleId={allData?.userId}
          dismiss={() => setExchangeModal(false)}
        />
      </Modal>
      <Modal
        className="the_new_class requestModal_class"
        visible={dateModal}
        footer={null}
        zIndex={9}
        onCancel={() => setDateModal(false)}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
          zIndex: 9,
        }}
      >
        <DateRequestModal
          data={allData}
          statusObj={dateRes}
          femaleId={allData?.userId}
          onUpdate={(res) => setDateRes(res)}
        />
      </Modal>
      {!AmIFemale && (
        <ShopModal
          visible={openGiftShop}
          dismiss={(success) => {
            if (success) checkEligibility();
            setOpenGiftShop(false);
          }}
          receiverId={allData?.userId}
        />
      )}
    </>
  );
}
