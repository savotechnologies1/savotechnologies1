import React, { useState, useEffect, useRef, useMemo, useContext } from "react";
import Head from "next/head";
import * as signalR from "@microsoft/signalr";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import InfiniteScroll from "react-infinite-scroller";
import { Row, Col, Empty, Alert, Space, Button, Modal } from "antd";
import { isEmpty, map, cloneDeep } from "lodash-es";
import {
  PeopleCard,
  AboutYouModal,
  ProfileIndex,
  ContactTable,
  DateTable,
  Emails,
  PresentsTable,
  Verifymodal,
  ChatContext,
} from "@components";
import fetchHelper from "@redux/utils/apiHelper";
import AuthActions from "@redux/reducers/auth/actions";
import {
  getMyProfileData,
  getSearchAndFilterOptions,
  getAppSettings,
  getMySettings,
} from "@redux/utils/commonFunctions";
import "./ContentData.module.less";
import siteConfig from "@config/siteConfig";
import useNotifySound from "@redux/utils/useNotifySound";
import VerifyFemale from "@components/VerifyFemale";

export default function ContentData(props) {
  const { span, startOffset } = props;
  const [verifyModal, setVerifyModal] = useState(false);
  const dispatch = useDispatch();
  const notifyTone = useNotifySound();
  const router = useRouter();
  const cc = useContext(ChatContext);
  const { isChatOpen } = cc;
  const {
    setMatchOptions,
    setSearchOptions,
    setCityList,
    setCountryList,
    setPeopleList,
    setNotifications,
    setTimezoneList,
    setChatSummary,
  } = AuthActions;

  const {
    token,
    userData,
    matchOptions,
    peopleList,
    notifications,
    chatSummary,
    cityList,
    countryList,
    timezoneList,
    appSettings,
    searchOptions,
    userProfile,
  } = useSelector((state) => state.auth);

  const [hubConnection, setHubConnection] = useState({});
  const [peopleDataRes, setPeopleDataRes] = useState([]);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [loader, setLoader] = useState(true);

  const listRef = useRef();
  useEffect(() => {
    listRef.current = peopleList;
  });

  const hasMoreData = useMemo(
    () =>
      peopleDataRes?.currentPage < peopleDataRes?.pageCount &&
      listRef.current?.length < peopleDataRes?.totalRowCount,
    [peopleDataRes, peopleList]
  );

  useEffect(() => {
    if (isEmpty(countryList)) {
      getCounrties();
    }
    if (isEmpty(cityList)) {
      getCities();
    }
    if (isEmpty(timezoneList)) {
      getTimezones();
    }
    if (isEmpty(appSettings)) {
      getAppSettings();
    }
    if (!isEmpty(token)) {
      getMySettings();
      initializeSignalR();
      getPeoplesList();
      (async () => {
        if (isEmpty(searchOptions)) {
          const filterData = await getSearchAndFilterOptions();
          dispatch(setSearchOptions(filterData));
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(token)) {
      shouldOpenModal();
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(matchOptions)) {
      getPeoplesList(false); // pagination, isfromFilters
    }
  }, [matchOptions]);

  useEffect(() => {
    //Reload when changing from the same url
    const handleRouteChange = (url) => {
      if (url === router.asPath) {
        let newSearchOptions = {};
        //Clear Search Filters other than Age. When reload
        map(matchOptions, (v, k) => {
          if (k == "minAge" || k == "maxAge") {
            newSearchOptions[k] = v;
          }
        });
        dispatch(setMatchOptions(newSearchOptions));
        router.reload();
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.asPath]);

  useEffect(() => {
    if (!isEmpty(token) && !isEmpty(hubConnection)) {
      hubConnection.on("changeUserOnlineStatus", handleOnlineStatus);
      hubConnection.on("notifyUser", handleNotificationUpdate);
    }

    return () => {
      if (isEmpty(token) && !isEmpty(hubConnection)) {
        hubConnection.stop();
        console.log("##Online SignalR Stoppedd");
      }
    };
  }, [token, hubConnection]);

  const initializeSignalR = () => {
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
    var hc = new signalR.HubConnectionBuilder()
      .withUrl(`${siteConfig.hubUrl}onlinehub/`, options)
      .withAutomaticReconnect()
      .withHubProtocol(protocol)
      .build();

    hc.start()
      .then(() => console.info("##Online SignalR Connected"))
      .catch((err) =>
        console.error("##Online SignalR Connection Error: ", err)
      );
    setHubConnection(hc);
  };

  const handleNotificationUpdate = (item) => {
    console.log("===> ~ NEW NOTIFICATION ", item);
    notifyTone.play(); // Will only play when Broswer Tab is Actively focused
    notifications.splice(0, 0, item);
    dispatch(setNotifications(notifications));
  };

  const handleOnlineStatus = (uid, newstatus) => {
    console.log("online status changed", uid, newstatus);
  };

  const getTimezones = async () => {
    let url = `Timezones/Getdropdown`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        dispatch(setTimezoneList(res));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCounrties = async () => {
    let url = `Countries/GetDropdown`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        dispatch(setCountryList(res));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCities = async () => {
    let url = `Cities/GetDropdown`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        dispatch(setCityList(res));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const shouldOpenModal = async () => {
    try {
      const fullProfileDetails = await getMyProfileData();
      if (
        fullProfileDetails.dateOfBirth === "0001-01-01T00:00:00" ||
        isEmpty(fullProfileDetails.city)
      ) {
        setAboutModalVisible(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPeoplesList = async (withPagination = false) => {
    if (!withPagination) {
      setLoader(true);
    }
    const searchData = cloneDeep(matchOptions);
    let data = {
      currentPage: 1,
      pageSize: 12,
    };

    if (!isEmpty(searchData.selectedOptions)) {
      data = {
        currentPage: 1,
        pageSize: 12,
        maritalStatuses: [],
        educations: [],
        englishProficiencies: [],
        religions: [],
        interests: [],
        smokings: [],
        alcohols: [],
        bodyTypes: [],
        eyeColors: [],
        hairColors: [],
      };

      map(data, (v, k) => {
        map(searchData?.selectedOptions, (sv) => {
          if (sv.key === k) {
            const clone = cloneDeep(data[k]);
            clone.push(sv.value);
            data[k] = clone;
          }
        });
      });
    }
    data.lowerAge = searchData?.minAge || 0;
    data.upperAge = searchData?.maxAge || 99;
    data.online = searchData?.online || false;
    data.verified = searchData?.verified || false;
    data.child = searchData?.child;

    if (searchData?.cityIds && searchData.cityIds[0]) {
      data.cityIds = searchData.cityIds;
    }
    if (searchData?.countryIds && searchData.countryIds[0]) {
      data.countryIds = searchData.countryIds;
    }

    if (withPagination) {
      let nextPage = peopleDataRes?.currentPage + 1;
      if (
        nextPage &&
        nextPage <= peopleDataRes?.pageCount &&
        peopleList?.length < peopleDataRes?.totalRowCount
      ) {
        data.currentPage = nextPage;
      } else {
        console.log("current page null");
        setLoader(false);
        return;
      }
    }

    let url = `${
      userData?.userType === "Male" ? "Females" : "Males"
    }/GetWithPaging`;

    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (res.currentPage > res.pageCount) {
        setLoader(false);
        return;
      }
      if (!isEmpty(res.data)) {
        if (withPagination) {
          const newList = peopleList.concat(res.data);
          if (newList.length <= res.totalRowCount) {
            dispatch(setPeopleList(newList)); // Redux List
          } else {
            setLoader(false);
          }
        } else {
          setLoader(false);
          dispatch(setPeopleList(res.data)); // Redux List
        }
        setPeopleDataRes(res);
        setLoader(false);
      } else {
        setPeopleDataRes({});
        dispatch(setPeopleList([]));
        setLoader(false);
      }
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
  };

  const PeopleListing = () => {
    return (
      <>
        <Head>
          <title>
            Find Hot Russian Girls on TrueBrides.com - Enjoy online dating with Russian and Ukrainian Brides!
          </title>
        </Head>
        <div className="containerDiv">
          <AboutYouModal
            visible={aboutModalVisible}
            dismiss={() => setAboutModalVisible(false)}
          />
          {userProfile?.user?.userType === "Female" ? (
            userProfile?.verified !== true ? (
              <VerifyFemale />
            ) : (
              <InfiniteScroll
                className="fullW"
                loadMore={() => getPeoplesList(true)}
                hasMore={!loader && hasMoreData}
                loader={
                  <Row className="fullW" gutter={[12, 20]}>
                    <PeopleCard isLoading={true} />
                    <PeopleCard isLoading={true} />
                    <PeopleCard isLoading={true} />
                    <PeopleCard isLoading={true} />
                  </Row>
                }
              >
                {userData && userData?.emailConfirmed === true ? null : (
                  <Row className="fullW" justify="center" align="middle">
                    <Alert
                      className={isChatOpen ? "openALertClass" : "alertClass"}
                      message="Hi, your email is not verified. Verify your email address."
                      type="warning"
                      action={
                        <Space>
                          <Button
                            size="small"
                            type="ghost"
                            onClick={() => setVerifyModal(true)}
                          >
                            Verify Now!
                          </Button>
                        </Space>
                      }
                      showIcon
                      closable
                    />
                    <Modal
                      visible={verifyModal}
                      footer={null}
                      zIndex={10}
                      onCancel={() => setVerifyModal(false)}
                      className="verify_modal_class"
                      maskStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <Verifymodal dismiss={() => setVerifyModal(false)} />
                    </Modal>
                  </Row>
                )}
                <Row className="fullW" gutter={[12, 20]}>
                  {loader ? (
                    [...new Array(16)].map((item, index) => (
                      <PeopleCard key={index} isLoading={true} />
                    ))
                  ) : !loader && isEmpty(peopleList) ? (
                    <Col span={24} className="NoDataView">
                      <Empty description="There are no users to display using your search criteria" />
                    </Col>
                  ) : (
                    peopleList.map((item, index) => (
                      <>
                        <PeopleCard data={item} key={index} />
                      </>
                    ))
                  )}
                </Row>
              </InfiniteScroll>
            )
          ) : (
            <InfiniteScroll
              className="fullW"
              loadMore={() => getPeoplesList(true)}
              hasMore={!loader && hasMoreData}
              loader={
                <Row className="fullW" gutter={[12, 20]}>
                  <PeopleCard isLoading={true} />
                  <PeopleCard isLoading={true} />
                  <PeopleCard isLoading={true} />
                  <PeopleCard isLoading={true} />
                </Row>
              }
            >
              {userData && userData?.emailConfirmed === true ? null : (
                <Row className="fullW" justify="center" align="middle">
                  <Alert
                    className={isChatOpen ? "openALertClass" : "alertClass"}
                    message="Hi, your email is not verified. Verify your email address."
                    type="warning"
                    action={
                      <Space>
                        <Button
                          size="small"
                          type="ghost"
                          onClick={() => setVerifyModal(true)}
                        >
                          Verify Now!
                        </Button>
                      </Space>
                    }
                    showIcon
                    closable
                  />
                  <Modal
                    visible={verifyModal}
                    footer={null}
                    zIndex={10}
                    onCancel={() => setVerifyModal(false)}
                    className="verify_modal_class"
                    maskStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.45)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Verifymodal dismiss={() => setVerifyModal(false)} />
                  </Modal>
                </Row>
              )}
              <Row className="fullW" gutter={[12, 20]}>
                {loader ? (
                  [...new Array(16)].map((item, index) => (
                    <PeopleCard key={index} isLoading={true} />
                  ))
                ) : !loader && isEmpty(peopleList) ? (
                  <Col span={24} className="NoDataView">
                    <Empty description="There are no users to display using your search criteria" />
                  </Col>
                ) : (
                  peopleList.map((item, index) => (
                    <>
                      <PeopleCard data={item} key={index} />
                    </>
                  ))
                )}
              </Row>
            </InfiniteScroll>
          )}
        </div>
      </>
    );
  };

  if (router?.asPath.startsWith("/people/date-request")) {
    return <DateTable span={span} startOffset={startOffset} />;
  } else if (router?.asPath.startsWith("/people/contact-exchange")) {
    return <ContactTable span={span} startOffset={startOffset} />;
  } else if (router?.asPath.startsWith("/people/presents")) {
    return <PresentsTable span={span} startOffset={startOffset} />;
  } else if (router?.asPath.startsWith("/people/inbox")) {
    return <Emails />;
  } else if (router?.asPath.startsWith("/people/")) {
    return <ProfileIndex span={span} startOffset={startOffset} />;
  } else {
    return <PeopleListing />;
  }
}
