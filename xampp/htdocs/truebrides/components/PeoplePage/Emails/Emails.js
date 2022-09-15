/* eslint-disable react/prop-types */
import {
  Row,
  Typography,
  Col,
  Button,
  Menu,
  Empty,
  Checkbox,
  Avatar,
  Rate,
  Radio,
  Tooltip,
  Spin,
  Pagination,
  Badge,
} from "antd";
import React, { useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import Head from "next/head";
import { Notify, ChatContext } from "@components";
import {
  StarOutlined,
  DeleteOutlined,
  SendOutlined,
  MailOutlined,
} from "@ant-design/icons";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import moment from "moment";
import siteConfig from "@config/siteConfig";
import { cloneDeep, has, isEmpty, map } from "lodash";
import fetchHelper from "@redux/utils/apiHelper";
import "./Emails.module.less";
import { getBadgeCount, getConversationId } from "@redux/utils/commonFunctions";
import { useRouter } from "next/router";

const { Text, Title } = Typography;

export default function Emails() {
  const { token, userData, badgeCount } = useSelector((state) => state.auth);
  const cc = useContext(ChatContext);
  const { isChatOpen } = cc;
  const router = useRouter();
  let [loading, setLoading] = useState(true);
  const [starLoading, setStarLoading] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("inbox");
  const [inboxList, setInboxList] = useState([]);
  const [showMode, setShowMode] = useState("ALL");
  const [selectedMails, setSelectedMails] = useState(new Set([]));
  const [badgeCounts, setBadgeCounts] = useState({
    inbox: 0,
    starred: 0,
    sent: 0,
    draft: 0,
    trash: 0,
  });
  const currentBP = useCurrentScreen();
  const isMedium = ["md", "lg"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);
  const badgeOffset = [3, 0];

  useEffect(() => {
    setBadgeCounts(badgeCount);
  }, [badgeCount]);

  useEffect(() => {
    getData();
  }, [currentMenu, showMode]);

  const getData = (withPagination = false) => {
    if (currentMenu == "inbox") getMailList(false, "INBOX", withPagination); // isStar, folderName, isWithPagination
    if (currentMenu == "starred") getMailList(true, "INBOX", withPagination);
    if (currentMenu == "sent") getMailList(false, "SENT", withPagination);
    if (currentMenu == "draft") getMailList(false, "DRAFTS", withPagination);
    if (currentMenu == "trash") getMailList(false, "TRASH", withPagination);
    getBadgeCount();
  };

  const getMailList = async (
    star = false,
    folder = "INBOX",
    pagination = false
  ) => {
    let url = `Mails/paging`;
    const data = {
      currentPage: 1,
      folder: folder,
      orderColumn: folder == "DRAFTS" ? "UpdateDate" : "SendDate",
      orderType: "desc",
      pageSize: 8,
      showMode: showMode,
      starred: star,
    };

    if (pagination > 0) {
      data.currentPage = pagination || 1;
    }

    setLoading(true);
    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        setInboxList(res);
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

  const deleteSelected = async () => {
    let url = `Mails/move-to-trash`;
    const data = [...selectedMails];
    map(data, (id, index) => {
      if (index == 0) {
        url = url + `?id=${id}`;
      } else {
        url = url + `&id=${id}`;
      }
    });
    setLoading(true);
    try {
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        // console.log("Success");
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
    getData();
  };

  const starThisMail = async (id) => {
    if (starLoading) {
      return;
    }
    let index1 = inboxList?.data
      ? inboxList?.data?.findIndex((item) => item.id == id)
      : -1;
    if (index1 != -1) {
      const clone = cloneDeep(inboxList.data[index1]);
      clone.receiverStarred = !clone.receiverStarred;
      inboxList.data.splice(index1, 1, clone);
      setInboxList({ ...inboxList });
    }
    //API CAll
    let url = `Mails/${id}/toggle-receiver-star`;
    setStarLoading(true);
    try {
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        // console.log("success");
      } else {
        Notify(
          "error",
          "Oops!",
          res.message || res.Message || "Something went wrong"
        );
      }
      setStarLoading(false);
      setCurrentMenu(currentMenu);
    } catch (error) {
      setStarLoading(false);
      setCurrentMenu(currentMenu);
    }
  };

  const markAsRead = async (id) => {
    let url = `Mails/${id}/Read`;
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
    } catch (error) {
      console.log(error);
    }
    getData();
  };

  const openThread = async (item) => {
    if (!item.readDate && item.receiverId === userData.id) {
      markAsRead(item.id);
    }
    let id = item.senderId;
    if (userData.id == item.senderId) {
      //CASE: Email is Received to me and sent by other person
      id = item.receiverId;
    }
    //API call to get the Thread Data
    let url = `Mails/Thread/${item.threadId}`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        cc.openChatFor({
          targetUserId: id,
          selectedConversationId: getConversationId(id),
        });
        cc.setEmailRead(res);
        cc.setMailOpen(true, true);
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

  const openProfile = (item) => {
    router.push(`/people/${item.senderId}`);
  };

  const handleCheckBox = (id) => {
    if (id == "all") {
      //select all the id in list
      if (!isEmpty(inboxList?.data)) {
        if (selectedMails.length == inboxList.data.length) {
          setSelectedMails([]);
          return;
        }
        let selectedArr = [];
        map(inboxList.data, (v) => selectedArr.push(v.id));
        setSelectedMails(selectedArr);
      }
      return;
    }
    const myset = new Set([...selectedMails]);
    if (myset.has(id)) {
      myset.delete(id);
    } else {
      myset.add(id);
    }
    setSelectedMails(myset);
  };

  const getTimeToDisplay = (time) => {
    return moment(time).fromNow();
  };

  const InboxView = () => {
    if (has(inboxList, "data") && !isEmpty(inboxList.data)) {
      return inboxList?.data?.map((item, index) => (
        <ListItem item={item} key={index} />
      ));
    }
    return <NoDataView />;
  };

  const ListItem = ({ item }) => {
    const photo = item?.sender?.photos.find((i) => i.profilePicture)?.photo
      .path;
    const photoSent = item?.receiver?.photos.find((i) => i.profilePicture)
      ?.photo.path;
    const isRead = item.readDate;
    return (
      <Row
        className={`listRow ${
          isRead && currentMenu !== "sent" && "listRow-Read"
        }`}
        onClick={() => openThread(item)}
      >
        {["inbox", "starred"].includes(currentMenu) && (
          <>
            <Col
              xs={1}
              md={1}
              lg={1}
              xl={1}
              className="colFlex"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={[...selectedMails].includes(item.id)}
                onChange={() => handleCheckBox(item.id)}
              ></Checkbox>
            </Col>
            <Col
              xs={2}
              md={isMedium && isChatOpen ? 2 : 1}
              lg={isMedium && isChatOpen ? 2 : 1}
              xl={1}
              className="colFlex"
              onClick={(e) => e.stopPropagation()}
            >
              <Rate
                disabled={starLoading}
                count={1}
                value={item.receiverStarred ? 1 : 0}
                onChange={() => starThisMail(item.id)}
              />
            </Col>
          </>
        )}
        <Col
          xs={4}
          md={isMedium && isChatOpen ? 4 : 2}
          lg={isMedium && isChatOpen ? 4 : 2}
          xl={2}
          className="colFlex"
        >
          <Avatar
            src={`${siteConfig.imgUrl}${
              currentMenu == "inbox"
                ? photo
                : currentMenu == "starred"
                ? photo
                : currentMenu == "trash"
                ? photo
                : photoSent
            }`}
            className="mail_avatar_img"
            onClick={() => openProfile(item)}
          />
          <div
            className={
              currentMenu === "sent" &&
              !isChatOpen &&
              item.receiver.online === true
                ? "mailsOnlineDot"
                : currentMenu === "sent" &&
                  !isChatOpen &&
                  item.receiver.online === false
                ? "mailsOflieDot"
                : currentMenu === "sent" &&
                  isChatOpen &&
                  item.receiver.online === true
                ? "openChatDot"
                : currentMenu === "sent" &&
                  isChatOpen &&
                  item.receiver.online === false
                ? "openOfflineChatDot"
                : !isChatOpen && item.sender.online === true
                ? "mailsOnlineDot"
                : !isChatOpen && item.sender.online === false
                ? "mailsOflieDot"
                : isChatOpen && item.sender.online === true
                ? "openChatDot"
                : isChatOpen && item.sender.online === false
                ? "openOfflineChatDot"
                : null
            }
          />
        </Col>
        <Col
          xs={12}
          md={isMedium && isChatOpen ? 11 : 16}
          lg={isMedium && isChatOpen ? 11 : 16}
          xl={16}
          className="colFlexStart"
        >
          <Row>
            <Text className="senderNameText" ellipsis={true}>
              {currentMenu == "inbox"
                ? item?.sender?.name || "-"
                : currentMenu == "starred"
                ? item?.sender?.name || "-"
                : currentMenu == "trash"
                ? item?.sender?.name || "-"
                : item?.receiver?.name || "-"}
            </Text>
          </Row>
          <Row>
            <Text className="subjectText" ellipsis={true}>
              {item.subject || "-"}
            </Text>
          </Row>
          <Row>
            <Text className="bodyText" ellipsis={true}>
              {item.body || "-"}
            </Text>
          </Row>
        </Col>
        <Col
          xs={5}
          md={isMedium && isChatOpen ? 6 : 4}
          lg={isMedium && isChatOpen ? 6 : 4}
          xl={4}
          className="colFlex"
        >
          <Text className="subjectText">{getTimeToDisplay(item.sendDate)}</Text>
        </Col>
      </Row>
    );
  };

  const ControlMenu = () => (
    <Row
      className={
        isMedium && isChatOpen ? "controlMenuActive" : "controlMenuRow noselect"
      }
    >
      <Col>
        <Checkbox
          className="mail_checkbox"
          checked={selectedMails.length === inboxList?.data?.length}
          onChange={() => handleCheckBox("all")}
        >
          Select All
        </Checkbox>
      </Col>
      <Col className="colFlex">
        <Radio.Group
          options={[
            { label: "All", value: "ALL" },
            { label: "Unread", value: "UNREAD" },
            { label: "Read", value: "READ" },
          ]}
          optionType="button"
          buttonStyle="solid"
          value={showMode}
          onChange={(e) => setShowMode(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      </Col>
      <Col>
        <Tooltip placement="topRight" title="Delete all selected">
          <Button
            disabled={[...selectedMails].length == 0}
            size="middle"
            icon={<DeleteOutlined />}
            className="deleteAllBtn"
            onClick={() => deleteSelected()}
          >
            Delete
          </Button>
        </Tooltip>
      </Col>
    </Row>
  );

  const NoDataView = () => (
    <div className="emptyView">
      <Empty description={<Title level={5}>You have no mails!</Title>} />
    </div>
  );

  const Loader = () => (
    <div span={24} className="emptyView">
      <Spin spinning size="large" />
    </div>
  );

  return (
    <>
      <Head>
        <title>Inbox</title>
      </Head>
      <div className="containerDiv2">
        <div className="topDiv">
          <Row className="titleRow">
            <Title level={3} className="mail_title_text">
              Mail Box
            </Title>
          </Row>
          <Row justify="center" align="middle">
            <Col span={24} className="menuBtnsContainer">
              <Menu
                theme="light"
                onClick={(e) => setCurrentMenu(e.key)}
                selectedKeys={[currentMenu]}
                mode="horizontal"
              >
                <Menu.Item
                  key="inbox"
                  icon={
                    <Badge
                      count={badgeCounts.inbox}
                      offset={badgeOffset}
                      size="small"
                    >
                      <MailOutlined />
                    </Badge>
                  }
                >
                  {isMobile || (isMedium && isChatOpen) ? null : "Inbox"}
                </Menu.Item>
                <Menu.Item
                  key="starred"
                  icon={
                    <Badge
                      count={badgeCounts.starred}
                      offset={badgeOffset}
                      size="small"
                    >
                      <StarOutlined />
                    </Badge>
                  }
                >
                  {isMobile || (isMedium && isChatOpen) ? null : "Starred"}
                </Menu.Item>
                <Menu.Item
                  key="sent"
                  icon={
                    <Badge
                      count={badgeCounts.sent}
                      offset={badgeOffset}
                      size="small"
                    >
                      <SendOutlined />
                    </Badge>
                  }
                >
                  {isMobile || (isMedium && isChatOpen) ? null : "Sent"}
                </Menu.Item>
                <Menu.Item
                  key="trash"
                  icon={
                    <Badge
                      count={badgeCounts.trash}
                      offset={badgeOffset}
                      size="small"
                    >
                      <DeleteOutlined />
                    </Badge>
                  }
                >
                  {isMobile || (isMedium && isChatOpen) ? null : "Trash"}
                </Menu.Item>
              </Menu>
            </Col>
          </Row>
          {["inbox", "starred"].includes(currentMenu) && <ControlMenu />}
        </div>
        <div className="midDiv">
          <Row style={{ height: "100%" }}>
            <Col span={24}>
              {loading ? (
                <Loader />
              ) : (
                <>
                  <InboxView />
                </>
              )}
            </Col>
          </Row>
        </div>
        {!isEmpty(inboxList) && (
          <div className="bottomDiv">
            <Row justify="center" align="middle">
              <Pagination
                defaultCurrent={inboxList?.currentPage}
                defaultPageSize={inboxList.pageSize}
                total={inboxList?.totalRowCount}
                current={inboxList?.currentPage}
                onChange={(nextPage) => getData(nextPage)}
                showSizeChanger={false}
              />
            </Row>
          </div>
        )}
      </div>
    </>
  );
}
