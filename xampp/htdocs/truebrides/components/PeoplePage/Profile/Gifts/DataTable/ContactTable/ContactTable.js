/* eslint-disable react/display-name */
import React, { useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import fetchHelper from "@redux/utils/apiHelper";
import siteConfig from "@config/siteConfig";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import {
  Table,
  Tag,
  Row,
  Col,
  Avatar,
  Empty,
  Typography,
  Divider,
  Spin,
} from "antd";
import moment from "moment";
import Images from "@config/images";
import "./ContactTable.module.less";
import { useRouter } from "next/router";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { ChatContext } from "@components";

const { Title, Text } = Typography;

function ContactTable() {
  const router = useRouter();
  const cc = useContext(ChatContext);
  const currentBP = useCurrentScreen();
  const isMedium = ["md"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);
  const { token, userData } = useSelector((state) => state.auth);
  const [data, setData] = useState();
  const [pageLoader, setPageLoader] = useState(true);
  const [loader, setLoader] = useState(false);
  const [show, setShow] = useState([]);
  const [filter, setFilter] = useState();
  const defaultFormat = "DD-MM-YYYY";
  const columns = [
    {
      title: "Lady",
      dataIndex: "femaleUser",
      key: "femaleUser",
      render: (text, data) => {
        let path = data?.femaleUser?.photos.find((i) => i.profilePicture)?.photo
          ?.path;
        return (
          <div
            className="table_avatar_div"
            onClick={() => {
              router.push(`/people/${data.femaleUserId}`);
            }}
          >
            <Col span={24} className="table_contact_avatar">
              <Avatar
                className="contact_avatar_img"
                src={`${siteConfig.imgUrl}${path}`}
              />
              <div
                className={
                  data?.femaleUser?.online === true
                    ? "onlineCircleRequest"
                    : "offlineCircleRequest"
                }
              />
              <div style={{ display: isMedium ? "block" : "block" }}>
                <span className="label">{cc.isChatOpen ? null : "Lady"}</span>
                <Text ellipsis={true} className="mobile-lbl-val">
                  {text.name || "-"}
                </Text>
              </div>
            </Col>
          </div>
        );
      },
    },
    {
      title: "RequestDate",
      dataIndex: "createDate",
      key: "createDate",
      render: (text) => {
        return (
          <div>
            <span className="label">
              {cc.isChatOpen ? null : "RequestDate"}
            </span>
            <span className="mobile-lbl-val">
              {" "}
              {(text && moment(text).format(defaultFormat)) || "-"}
            </span>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => {
        return (
          <div>
            <span className="label">{cc.isChatOpen ? null : "Status"}</span>
            <span className="mobile-lbl-val">
              <Tag
                color={
                  text === "Pending"
                    ? "red"
                    : text === "Approved"
                    ? "green"
                    : "purple"
                }
              >
                {text}
              </Tag>
            </span>
          </div>
        );
      },
    },
    {
      title: "Email",
      className: "fullname-cell",
      dataIndex: "femaleEmail",
      render: (text, data) => {
        return (
          <div>
            <span className="label">{cc.isChatOpen ? null : "Email"}</span>
            <span className="mobile-lbl-val">
              {text ? (
                !show.includes(data.id) ? (
                  <EyeOutlined onClick={() => setShow([...show, data.id])} />
                ) : (
                  <>
                    {text + " "}
                    <EyeInvisibleOutlined
                      onClick={() => {
                        let newShow = [...show];
                        const index = newShow.indexOf(data.id);
                        if (index !== -1) {
                          newShow.splice(index, 1);
                        }
                        setShow(newShow);
                      }}
                    />
                  </>
                )
              ) : (
                "-"
              )}
            </span>
          </div>
        );
      },
    },
  ];

  function onChange(pagination) {
    const flt = { ...filter };
    flt.currentPage = pagination.current;
    flt.pageSize = pagination.pageSize;
    setFilter(flt);
    fetchData(flt);
  }

  useEffect(() => {
    fetchData(
      filter
        ? filter
        : {
            currentPage: 1,
            pageSize: 10,
          }
    );
  }, []);

  const fetchData = async (data) => {
    setLoader(true);
    let url = `ContactExchanges/Current`;
    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
      setData(res.data);
      setFilter({
        currentPage: res.currentPage,
        total: res.totalRowCount,
        pageSize: res.pageSize,
      });
      setLoader(false);
      setPageLoader(false);
    } catch (error) {
      setLoader(false);
      setPageLoader(false);
    }
  };

  if (pageLoader) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <img src={Images.loadingHearts} width="100px" />
      </div>
    );
  }

  return (
    <Row className="contactTableRow">
      <Col
        span={24}
        lg={{ offset: 0, span: 24 }}
        md={{ offset: 0, span: 24 }}
        className="contact_table_col"
      >
        <Title
          level={3}
          style={{ paddingTop: 20, textAlign: "center" }}
          className="tableNameCol"
        >
          Contact Exchange Requests
        </Title>
        <Divider />
        <Spin spinning={loader}>
          {userData?.userType === "Male" && data.length > 0 ? (
            <Table
              className={cc.isChatOpen ? "open_contactRow" : "tableCol"}
              size="large"
              columns={columns}
              dataSource={data}
              pagination={filter}
              onChange={onChange}
              scroll={{ y: isMobile ? 550 : 615 }}
            />
          ) : (
            <Col span={24} className="NoDataView">
              {userData?.userType === "Female" ? (
                <Empty />
              ) : (
                <Empty description="You don't have any contact exchange requests." />
              )}
            </Col>
          )}
        </Spin>
      </Col>
    </Row>
  );
}

export default ContactTable;
