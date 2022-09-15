/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/display-name */
import React, { useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import fetchHelper from "@redux/utils/apiHelper";
import siteConfig from "@config/siteConfig";
import moment from "moment";
import { isEmpty, size } from "lodash-es";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  RightOutlined,
} from "@ant-design/icons";
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
  Tooltip,
  Button,
  Modal,
} from "antd";
import Images from "@config/images";
import "./DateTable.module.less";
import { useRouter } from "next/router";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { ChatContext } from "@components";

const { Title, Paragraph, Text } = Typography;

export default function DateTable() {
  const router = useRouter();
  const cc = useContext(ChatContext);
  const currentBP = useCurrentScreen();
  const isMobile = ["xs"].includes(currentBP);
  const { token, userData } = useSelector((state) => state.auth);
  const [data, setData] = useState();
  const [show, setShow] = useState([]);
  const [filter, setFilter] = useState();
  const [loading, setLoading] = useState(true);
  const [pageLoader, setPageLoader] = useState(true);
  const [rescheduledModal, setRescheduledModal] = useState(false);
  const defaultFormat = "DD-MM-YYYY, h:mm:ss a";

  useEffect(() => {
    initialFetch();
  }, []);

  const initialFetch = () => {
    fetchData(
      filter
        ? filter
        : {
            currentPage: 1,
            pageSize: 10,
          }
    );
  };

  function onChange(pagination) {
    const flt = { ...filter };
    flt.currentPage = pagination.current;
    flt.pageSize = pagination.pageSize;
    setFilter(flt);
    fetchData(flt);
  }

  const fetchData = async (data) => {
    setLoading(true);
    let url = `DateRequests/Current`;
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
      setLoading(false);
      setPageLoader(false);
    } catch (error) {
      setLoading(false);
      setPageLoader(false);
    }
  };

  const approveRequest = async (data) => {
    let url = `DateRequests/${data?.id}/Approve`;
    try {
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (res) {
        initialFetch();
        setLoading(false);
        setPageLoader(false);
        setRescheduledModal(false);
      }
    } catch (error) {
      setLoading(false);
      setPageLoader(false);
    }
  };

  const declineRequest = async (data) => {
    let url = `DateRequests/${data?.id}/Decline?reason=User%20declined%20reschedule%20request`;
    try {
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (res) {
        initialFetch();
        setRescheduledModal(false);
        setLoading(false);
        setPageLoader(false);
      }
    } catch (error) {
      setLoading(false);
      setPageLoader(false);
    }
  };

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
            <Col span={24} className="table_col_avatar">
              <Avatar
                className="date_avatar_img"
                src={`${siteConfig.imgUrl}${path}`}
              />
              <div
                className={
                  data?.femaleUser?.online === true
                    ? "onlineCircleDate"
                    : "offlineCircleDate"
                }
              />
              <span className="label">{cc.isChatOpen ? null : "Lady"}</span>
              <Text ellipsis={true} className="mobile-lbl-val name_text_date">
                {text.name || "-"}
              </Text>
            </Col>
          </div>
        );
      },
    },
    {
      title: "Meeting Date",
      dataIndex: "dateDate",
      key: "dateDate",
      render: (text) => {
        return (
          <div>
            <span className="label">
              {cc.isChatOpen ? null : "Meeting Date"}
            </span>
            <span className="mobile-lbl-val">
              {(text && moment(text).format(defaultFormat)) || "-"}
            </span>
          </div>
        );
      },
    },
    {
      title: "Restaurant",
      dataIndex: "restaurant",
      render: (text) => {
        return (
          <div>
            <span className="label">{cc.isChatOpen ? null : "Restaurant"}</span>
            <span className="mobile-lbl-val">{text || "-"}</span>
          </div>
        );
      },
    },
    {
      title: "Comment",
      dataIndex: "comment",
      render: (text) => {
        return (
          <div>
            <span className="label">{cc.isChatOpen ? null : "Comment"}</span>
            <span className="mobile-lbl-val">
              {
                <Tooltip
                  placement="bottom"
                  title={size(text) > 20 ? text : null}
                >
                  <Paragraph
                    style={{ margin: 0 }}
                    rows={2}
                    ellipsis={size(text) > 20 ? true : false}
                  >
                    {text || "-"}
                  </Paragraph>
                </Tooltip>
              }
            </span>
          </div>
        );
      },
    },
    {
      title: "ManagerPhone",
      dataIndex: "managerPhone",
      render: (text, data) => {
        return (
          <div>
            <span className="label">
              {cc.isChatOpen ? null : "ManagerPhone"}
            </span>
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
    {
      title: "Status",
      dataIndex: "status",
      className: "fullname-cell",
      render: (text, data) => {
        return (
          <div>
            <span className="label">{cc.isChatOpen ? null : "Status"}</span>
            <span className="mobile-lbl-val">
              {
                <div>
                  {data.status === "Rescheduled" ? (
                    <Button
                      type="primary"
                      className="rescheduled_btn"
                      onClick={() => setRescheduledModal(data)}
                      icon={<RightOutlined />}
                    >
                      {text}
                    </Button>
                  ) : (
                    <Tag
                      style={{
                        cursor: data.status === "Declined" ? "pointer" : null,
                      }}
                      color={
                        text === "Pending"
                          ? "purple"
                          : text === "Approved"
                          ? "green"
                          : text === "Occured"
                          ? "cyan"
                          : "error"
                      }
                    >
                      {data.status === "Declined" ? (
                        <Tooltip
                          placement="top"
                          title={`Reason: ${data.declineReason || "-"}`}
                        >
                          {text}
                        </Tooltip>
                      ) : (
                        text
                      )}
                    </Tag>
                  )}
                </div>
              }
            </span>
          </div>
        );
      },
    },
  ];

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
    <Row className={cc.isChatOpen ? "open_dateRow" : "dateTableRow"}>
      <Col span={24} className="contact_table_col">
        <Title
          level={3}
          style={{ paddingTop: 20, textAlign: "center" }}
          className="tableNameCol"
        >
          Date Requests
        </Title>
        <Divider />
        <Spin spinning={loading}>
          {userData?.userType === "Male" && data.length > 0 ? (
            <>
              <Table
                className="tableCol"
                size="large"
                columns={columns}
                dataSource={data}
                pagination={filter}
                onChange={onChange}
                scroll={{ y: isMobile ? 550 : 615 }}
              />
              {rescheduledModal &&
                rescheduledModal &&
                !isEmpty(rescheduledModal) && (
                  <Modal
                    visible={true}
                    footer={null}
                    zIndex={10}
                    closable={true}
                    onCancel={() => setRescheduledModal(false)}
                    className="request_modal_settings"
                    maskStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.45)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Row>
                      <Col span={24}>
                        <Text className="approve_text">
                          Approve Date Request
                        </Text>
                        <div className="line_div">
                          <Text className="initial_text">
                            Your initial request has been rescheduled
                          </Text>
                          <div className="flex_div">
                            <Col
                              className="new_data_col"
                              xs={{ span: 10 }}
                              sm={{ span: 6 }}
                              md={{ span: 6 }}
                              lg={{ span: 6 }}
                              xl={{ span: 6 }}
                            >
                              <Text className="new_data" strong>
                                New Date:
                              </Text>
                              <Text className="new_data" strong>
                                New Restaurant:
                              </Text>
                            </Col>
                            <Col
                              className="new_data_col"
                              span={18}
                              xs={{ span: 14 }}
                              sm={{ span: 18 }}
                              md={{ span: 18 }}
                              lg={{ span: 18 }}
                              xl={{ span: 18 }}
                            >
                              <Text className="new_place">
                                {(rescheduledModal?.dateDate &&
                                  moment(rescheduledModal?.dateDate).format(
                                    defaultFormat
                                  )) ||
                                  "-"}
                              </Text>
                              <Text className="new_place">
                                {rescheduledModal?.restaurant}
                              </Text>
                            </Col>
                          </div>
                          <Text className="confirm_txt">
                            Do you confirm your new appointment?
                          </Text>
                        </div>
                        <Row justify="center">
                          <Button
                            className="approve_btn"
                            onClick={() => approveRequest(rescheduledModal)}
                          >
                            Approve
                          </Button>
                          <Button
                            className="reject_btn"
                            type="primary"
                            onClick={() => declineRequest(rescheduledModal)}
                          >
                            Reject
                          </Button>
                        </Row>
                      </Col>
                    </Row>
                  </Modal>
                )}
            </>
          ) : (
            <Col span={24} className="NoDataView">
              {userData?.userType === "Female" ? (
                <Empty />
              ) : (
                <Empty description="You don't have any meeting requests." />
              )}
            </Col>
          )}
        </Spin>
      </Col>
    </Row>
  );
}
