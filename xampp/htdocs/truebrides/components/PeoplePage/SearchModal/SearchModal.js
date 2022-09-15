/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Row,
  Typography,
  Select,
  Button,
  Col,
  Affix,
  Tag,
  Spin,
  Checkbox,
} from "antd";
import { has, isEmpty, isNumber, cloneDeep } from "lodash-es";
import AuthActions from "@redux/reducers/auth/actions";
import { ageGroup1, ageGroup2 } from "@config/staticData";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { ChatContext } from "@components";
import { useRouter } from "next/router";
import "../SearchModal/SearchModal.module.less";

const { Text, Title } = Typography;
const { Option } = Select;

const { setMatchOptions } = AuthActions;

function SearchModal(props) {
  const { dismiss } = props;
  const router = useRouter();
  const { searchOptions, matchOptions, cityList, countryList, userData } =
    useSelector((state) => state.auth);
  const cc = useContext(ChatContext);
  const dispatch = useDispatch();
  const currentBP = useCurrentScreen();
  const [minAge, setMinAge] = useState(matchOptions?.minAge || ageGroup1[0]);
  const [maxAge, setMaxAge] = useState(matchOptions?.maxAge || ageGroup2[4]);
  const [readMore, setReadMore] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [optionsState, setOptionsState] = useState([]);
  const [defaultTab, setDefaultTab] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedCities, setSelectedCities] = useState(undefined); // only one option be selected
  const [selectedCountries, setSelectedCountries] = useState(undefined); // only one option be selected
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const isMd = ["md"].includes(currentBP);
  const isTab = ["sm"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);

  const containerRef = useRef(null);

  const selectProps = {
    //Disable Scroll of back container and body When Scrolling inside Select Dropdown Menu
    onFocus: () => {
      document.body.style = "overflow: hidden";
      if (containerRef.current && containerRef.current) {
        containerRef.current.style.overflow = "hidden";
      }
    },
    onBlur: () => {
      document.body.style = "overflow:auto";
      if (containerRef.current) {
        containerRef.current.style = "overflow:auto";
      }
    },
  };

  useEffect(() => {
    if (!isEmpty(matchOptions)) {
      if (has(matchOptions, "cityIds") && matchOptions.cityIds.length === 1) {
        setSelectedCities(matchOptions?.cityIds[0]);
      }
      if (
        has(matchOptions, "countryIds") &&
        matchOptions.countryIds.length === 1
      ) {
        setSelectedCountries(matchOptions?.countryIds[0]);
      }
      if (
        has(matchOptions, "verified") &&
        typeof matchOptions.verified === "boolean"
      ) {
        setIsVerified(matchOptions?.verified);
      }
      if (
        has(matchOptions, "online") &&
        typeof matchOptions.online === "boolean"
      ) {
        setIsOnline(matchOptions?.online);
      }
      if (
        has(matchOptions, "selectedOptions") &&
        !isEmpty(matchOptions.selectedOptions)
      ) {
        setSelectedOptions(matchOptions.selectedOptions);
      }
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(searchOptions) && isEmpty(optionsState)) {
      //  Added static filter for Child
      let data = cloneDeep(searchOptions);
      const newId = data.findIndex((i) => i.code === "MARITAL_STATUS");

      const haveOne = matchOptions && matchOptions.selectedOptions ? matchOptions.selectedOptions.findIndex((o) => o.code === "NO_CHILD") : -1;
      const haveTwo = matchOptions && matchOptions.selectedOptions ? matchOptions.selectedOptions.findIndex((o) => o.code === "HAVE_CHILDREN") : -1;

      const childObj = {
        code: "CHILD",
        name: "Child",
        data: [
          {
            groupCode: "CHILD",
            code: "NO_CHILD",
            value: "No Child",
            description: "",
            id: (haveOne >= 0 && matchOptions.selectedOptions[haveOne]) ? matchOptions.selectedOptions[haveOne].id : Math.floor(Math.random() * 10000),
          },
          {
            groupCode: "CHILD",
            code: "HAVE_CHILDREN",
            value: "Have Children",
            description: "",
            id: (haveTwo >= 0 && matchOptions.selectedOptions[haveTwo]) ? matchOptions.selectedOptions[haveTwo].id : Math.floor(Math.random() * 10000),
          },
        ],
        display: true,
      };
      if (newId >= 0) {
        data.splice((newId+1), 0, childObj);
      } else {
        data.push(childObj);
      }
      setOptionsState(data);
      setDefaultTab(data[0]);
    }
  }, [searchOptions]);

  useEffect(() => {
    if (isEmpty(matchOptions)) {
      resetAll();
    }
  }, [matchOptions]);

  const handleOption = (option) => {
    let nData = [...selectedOptions];
    const removeIndex = selectedOptions.findIndex((o) => o.id == option.id);
    if (removeIndex >= 0) {
      nData.splice(removeIndex, 1);
      setSelectedOptions(nData);
    } else {
      nData.push(option);
      setSelectedOptions(nData);
    }
  };

  const resetAll = (type = "") => {
    setReadMore(false);
    if (type && type === "default") {
      setDefaultTab(searchOptions[0]);
      setMinAge(ageGroup1[0]);
      setMaxAge(ageGroup2[4]);
      setSelectedOptions([]);
      setSelectedCountries(undefined);
      setSelectedCities(undefined);
      setIsOnline(false);
      setIsVerified(false);
    }
  };

  const checkChildFilter = (selectedOptionsData) => {
    let child = null;
    const cnt = selectedOptionsData.filter((i) => i.groupCode === "CHILD").length;
    if(cnt > 0 && cnt < 2) {
      const haveChileFilter = selectedOptionsData.findIndex((i) => i.groupCode === "CHILD");
      if(haveChileFilter >= 0 && selectedOptionsData[haveChileFilter] && selectedOptionsData[haveChileFilter].value){
        if(selectedOptionsData[haveChileFilter].value === "No Child"){
          child = false;
        } else if (selectedOptionsData[haveChileFilter].value === "Have Children") {
          child = true;
        }
      }
    }
    return child;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    let child = checkChildFilter(selectedOptions);

    let searchObj = {
      minAge,
      maxAge,
      child: child,
      online: isOnline,
      verified: isVerified,
      selectedOptions,
    };

    if (selectedCities) {
      searchObj.cityIds = [selectedCities];
    }
    if (selectedCountries) {
      searchObj.countryIds = [selectedCountries];
    }

    dispatch(setMatchOptions(searchObj));
    dismiss();
    if (router.asPath !== "/people") {
      router.push("/people");
    }
  };

  const addMoreContent = (
    <span className="sideContent">
      <Col>
        {optionsState.map((item, key) => {
          if (userData.userType === "Female" && item.code === "ENGLISH_PROF") {
            return;
            //since the Male dont have English Profieciency
          }
          const isSelected = item.code === defaultTab.code;
          return (
            <Col
              key={key}
              style={{
                backgroundColor: isSelected ? "#e6e6e6 " : "#f5f5f5 ",
              }}
              className="hoverClassItem"
            >
              <Col className="tabView" onClick={() => setDefaultTab(item)}>
                <Text
                  style={{
                    color: isSelected ? "#d5232f " : "#222 ",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  {item.name}
                </Text>
              </Col>
            </Col>
          );
        })}
      </Col>
      <Col className="subSide">
        {!isEmpty(defaultTab?.data) && defaultTab.display
          ? defaultTab.data.map((item, key) => {
              const ind = selectedOptions.findIndex((o) => o.id === item.id);
              const isSelected = ind >= 0;
              return (
                <Col
                  key={key}
                  className={`sideBartabView ${
                    isSelected && "sideBartabView-active"
                  }`}
                  onClick={() => handleOption(item)}
                >
                  <Text className={`subSide${isSelected && "-active"}`}>
                    {item.value}
                  </Text>
                </Col>
              );
            })
          : null}
      </Col>
    </span>
  );

  return (
    <Affix
      offsetTop={isMobile ? 63 : isMd || isTab ? 65 : 90}
      className="searchModalAffix"
      style={{ width: isMd ? "100%" : null }}
    >
      <div
        ref={containerRef}
        className={`searchModalLayout ${cc?.isChatOpen && "shifted"} ${
          readMore && "allowScroll"
        }`}
      >
        {loading ? (
          <>
            <Spin size="large" />
          </>
        ) : (
          <>
            <Row className="modalHeaderRow">
              <Title level={4} className="searchBox_header">
                Search for Your Matches
              </Title>
              <Button
                className="setDefBtn"
                type="text"
                onClick={() => resetAll("default")}
              >
                <Text className="defaultTitle">Set as default</Text>
              </Button>
            </Row>
            <Row className="selectionRow">
              <Text className="searchAgesText">Ages</Text>
              <Select
                {...selectProps}
                getPopupContainer={(trigger) => trigger.parentElement}
                listHeight={isMobile || isTab ? 200 : 230}
                bordered={true}
                value={minAge}
                className="searchModalInput"
                onChange={(item) => setMinAge(item)}
              >
                {ageGroup1.map((age) => {
                  return (
                    <Option value={age} key={age.toString()}>
                      {age.toString()}
                    </Option>
                  );
                })}
              </Select>
              <Text className="deshLine"></Text>
              <Select
                {...selectProps}
                getPopupContainer={(trigger) => trigger.parentElement}
                listHeight={isMobile || isTab ? 200 : 230}
                bordered={true}
                value={maxAge}
                className="searchModalInput"
                onChange={(item) => setMaxAge(item)}
              >
                {ageGroup2.map((age) => {
                  return (
                    <Option value={age} key={age.toString()}>
                      {age.toString()}
                    </Option>
                  );
                })}
              </Select>
            </Row>
            <Row>
              <Select
                {...selectProps}
                getPopupContainer={(trigger) => trigger.parentNode}
                placeholder="Enter Country"
                className="cityDropdown"
                showSearch
                optionFilterProp="children"
                value={selectedCountries}
                dropdownClassName="dropdownClasssssss"
                listHeight={readMore ? 250 : 130}
                onChange={(v) => {
                  if (v != setSelectedCountries) {
                    setSelectedCities(undefined);
                  }
                  setSelectedCountries(v);
                }}
                dropdownStyle={{
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                }}
              >
                {!isEmpty(countryList) &&
                  countryList.map((v) => {
                    return (
                      <Option value={v.value} key={v.value}>
                        {v.label}
                      </Option>
                    );
                  })}
              </Select>
            </Row>
            <Row>
              <Select
                listHeight={readMore ? 250 : 130}
                {...selectProps}
                getPopupContainer={(trigger) => trigger.parentNode}
                placeholder="Enter City"
                className="cityDropdown"
                dropdownClassName="dropdownClasssssss"
                showSearch
                disabled={
                  isEmpty(selectedCountries) && !isNumber(selectedCountries)
                }
                optionFilterProp="children"
                value={selectedCities}
                onChange={(v) => setSelectedCities(v)}
                dropdownStyle={{
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                }}
              >
                {!isEmpty(cityList) &&
                  cityList.map((v) => {
                    if (v.parentId == selectedCountries) {
                      return (
                        <Option value={v.value} key={v.value}>
                          {v.label}
                        </Option>
                      );
                    }
                  })}
              </Select>
            </Row>
            <Row className="checkboxRow">
              <Col span={12}>
                <Checkbox
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                >
                  <Text className="searchAgesText">Online</Text>
                </Checkbox>
              </Col>
              {userData?.userType === "Male" && (
                <Col span={12} style={{ textAlign: "right" }}>
                  <Checkbox
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                  >
                    <Text className="searchAgesText">Verified</Text>
                  </Checkbox>
                </Col>
              )}
            </Row>
            <Row className="selectedTags">
              {selectedOptions.map((it) => {
                return (
                  <Tag
                    key={it.id}
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      handleOption(it);
                    }}
                  >
                    {it.value}
                  </Tag>
                );
              })}
            </Row>
            <Row className="moreLessRow noselect" justify="center">
              <Col>
                <Text
                  onClick={() => setReadMore(!readMore)}
                  className="moreLessText"
                >
                  Add more filters
                </Text>
              </Col>
            </Row>
            <Row>
              <Col>{readMore && addMoreContent}</Col>
            </Row>
            <Row className="showBtnDiv">
              <div className="btnFixedDiv">
                <Button
                  type="primary"
                  block
                  className="showBtn"
                  onClick={handleSubmit}
                >
                  FIND MATCHES
                </Button>
              </div>
            </Row>
          </>
        )}
      </div>
    </Affix>
  );
}

export default SearchModal;
