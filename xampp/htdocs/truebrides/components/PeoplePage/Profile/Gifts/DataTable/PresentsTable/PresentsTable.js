/* eslint-disable react/display-name */
import React, { useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import fetchHelper from "@redux/utils/apiHelper";
import siteConfig from "@config/siteConfig";
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
import "./PresentsTable.module.less";
import Lightbox from "react-image-lightbox";
import { useRouter } from "next/router";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { ChatContext } from "@components";

const { Title, Text } = Typography;

function PresentsTable() {
  const router = useRouter();
  const cc = useContext(ChatContext);
  const currentBP = useCurrentScreen();
  const isMedium = ["md"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);
  const { token, userData } = useSelector((state) => state.auth);
  const [data, setData] = useState();
  const [pageLoader, setPageLoader] = useState(true);
  const [loader, setLoader] = useState(false);
  const [imageOpend, setImageOpend] = useState("");
  const [filter, setFilter] = useState();
  const defaultFormat = "DD-MM-YYYY";
  const columns = [
    {
      title: "Lady",
      dataIndex: "femaleUser",
      key: "femaleUser",
      render: (text, data) => {
        let path = data?.recipient?.photos.find((i) => i.profilePicture)?.photo
          ?.path;
        return (
          <div
            className="table_avatar_div"
            onClick={() => {
              router.push(`/people/${data.recipientId}`);
            }}
          >
            <Col span={24} className="table_contact_avatar">
              <Avatar
                className="contact_avatar_img"
                src={`${siteConfig.imgUrl}${path}`}
              />
              <div
                className={
                  data?.recipient?.online === true
                    ? "onlineCircleRequest"
                    : "offlineCircleRequest"
                }
              />
              <div style={{ display: isMedium ? "block" : "block" }}>
                <span className="label">{cc.isChatOpen ? null : "Lady"}</span>
                <Text ellipsis={true} className="mobile-lbl-val">
                  {data.recipient.name || "-"}
                </Text>
              </div>
            </Col>
          </div>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createDate",
      key: "createDate",
      render: (text) => {
        return (
          <div>
            <span className="label">{cc.isChatOpen ? null : "Date"}</span>
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
              <Tag color={text === 0 ? "purple" : text === 1 ? "green" : "red"}>
                {text === 0
                  ? "Pending"
                  : text === 1
                  ? "Delivered"
                  : "Cancelled"}
              </Tag>
            </span>
          </div>
        );
      },
    },
    {
      title: "Total",
      className: "fullname-cell",
      dataIndex: "total",
      render: (text, data) => {
        return (
          <div>
            <span className="label">{cc.isChatOpen ? null : "Total"}</span>
            <span className="mobile-lbl-val">
              {text ? <Text>{data.total}</Text> : "-"}
            </span>
          </div>
        );
      },
    },
    {
      title: "Verification",
      className: "fullname-cell",
      dataIndex: "verification",
      render: (text, data) => {
        let path = data?.verificationPhoto?.path;
        return (
          <div>
            <span className="label">
              {cc.isChatOpen ? null : "Verification"}
            </span>
            <span className="mobile-lbl-val">
              {data.verificationPhotoId === null ? (
                "Pending"
              ) : (
                <img
                  onClick={() => setImageOpend(path)}
                  src={`${siteConfig.imgUrl}${path}`}
                  style={{
                    width: 45,
                    height: 45,
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              )}
            </span>
            {imageOpend && (
              <Lightbox
                discourageDownloads
                enableZoom={false}
                mainSrc={`${siteConfig.imgUrl}${data?.verificationPhoto?.path}`}
                onCloseRequest={() => setImageOpend(false)}
              />
            )}
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
            ownerId: userData?.id,
          }
    );
  }, []);

  const fetchData = async (data) => {
    setLoader(true);
    let url = `Orders/GetWithPaging`;
    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
      setData(res.data);
      setFilter({
        currentPage: res.currentPage,
        total: res.totalRowCount,
        pageSize: res.pageSize,
        ownerId: userData?.id,
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
    <Row className="presentTableRow">
      <Col
        span={24}
        md={{ offset: 0, span: 24 }}
        lg={{ offset: 0, span: 24 }}
        xl={{ offset: 0, span: 24 }}
        className="present_table_col"
      >
        <Title
          level={3}
          style={{ paddingTop: 20, textAlign: "center" }}
          className="tableNameCol"
        >
          My Orders
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
                <Empty description={<span>You don't have any orders.</span>} />
              )}
            </Col>
          )}
        </Spin>
      </Col>
      {imageOpend && (
        <Lightbox
          discourageDownloads
          enableZoom={false}
          mainSrc={`${siteConfig.imgUrl}${imageOpend}`}
          onCloseRequest={() => setImageOpend(false)}
        />
      )}
    </Row>
  );
}

export default PresentsTable;
