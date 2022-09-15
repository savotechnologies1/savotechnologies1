import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import {
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Select,
  Form,
  InputNumber,
  Input,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { aboutMeData, haveChildrens } from "@config/staticData";
import {
  capitalize,
  cloneDeep,
  find,
  has,
  isArray,
  isEmpty,
  isNull,
  map,
} from "lodash";
import {
  displayChildCount,
  displayHeight,
  displayWeight,
  getSearchAndFilterOptions,
} from "@redux/utils/commonFunctions";
import { height } from "@config/staticData";
import AuthActions from "@redux/reducers/auth/actions";
import { Notify } from "@components";
import fetchHelper from "@redux/utils/apiHelper";
import "./AboutMe.module.less";
import useCurrentScreen from "@redux/utils/useCurrentScreen";

const { Text } = Typography;
const { Option } = Select;

function AboutMe(props) {
  const { editable, data, onUpdate } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { setSearchOptions } = AuthActions;
  const { userData, token, cityList, countryList, searchOptions } = useSelector(
    (state) => state.auth
  );

  const isMobile = ["xs"].includes(useCurrentScreen());
  const [displayData, setDisplayData] = useState([]);
  const [modal, setModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);

  //Dropdown options
  const [educationOptions, setEducationOptions] = useState([]);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState([]);
  const [smokingOptions, setSmokingOptions] = useState([]);
  const [drinkingOptions, setDrinkingOptions] = useState([]);
  const [bodyOptions, setBodyOptions] = useState([]);
  const [eyeColorOptions, setEyeColorOptions] = useState([]);
  const [hariColorOptions, setHariColorOptions] = useState([]);
  const [defaultOptions, setDefaultOptions] = useState({});
  const [cityDisabled, setCityDisabled] = useState(true);
  const [religionOptions, setReligionOptions] = useState([]);
  const [langProfOptions, setLangProfOptions] = useState([]);
  //End of Dropdown Options
  const [refresh, setRefresh] = useState(true);

  const filteredCities = useMemo(() => {
    if (!isEmpty(cityList) && cityList) {
      return cityList.filter(
        (city) => city.parentId == form.getFieldValue("countryId")
      );
    }
    return cityList;
  }, [refresh, cityList, modal]);

  useEffect(() => {
    if (!refresh) {
      setTimeout(() => {
        setRefresh(true);
      }, 100);
    }
  }, [refresh]);

  useEffect(() => {
    handleFormChanges();
  }, [defaultOptions]);

  useEffect(() => {
    initialData();
    if (editable) {
      if (!isEmpty(searchOptions)) {
        setDropDownOptions();
      } else {
        (async () => {
          const filterData = await getSearchAndFilterOptions();
          dispatch(setSearchOptions(filterData));
        })();
      }
    }
  }, [searchOptions, data, modal]);

  const initialData = () => {
    const dd = [...aboutMeData];
    let defaultOpt = {};
    map(aboutMeData, (v, k) => {
      map(data, (vd, vk) => {
        if (has(v, "key") && v.key === vk) {
          let ans = vd;
          if ((isEmpty(ans) && isNaN(ans)) || isNull(ans)) {
            ans = "No Answer";
          } else {
            ans = vd;
            defaultOpt[vk] = vd;
          }
          //For city check id and find name
          if (vk === "cityId") {
            map(cityList, (item) => {
              if (item.value == vd) {
                let cO = countryList.find((x) => item.parentId === x.value);
                ans = `${item.label}, ${cO.label}`;
              }
            });
          }
          if (vk === "height" && Number(ans) > 0) {
            ans = displayHeight(vd.toString());
          }
          if (vk === "weight" && Number(ans) > 0) {
            ans = displayWeight(vd.toString());
          }
          if ((vk === "weight" || vk === "height") && ans == 0) {
            ans = "No Answer";
            defaultOpt[vk] = undefined;
          }
          if (vk === "childrenCount" && ans > 0) {
            ans === 6
              ? (ans = "More than 5 Children")
              : (ans = `${displayChildCount(vd.toString())} ${
                  ans === 1 ? "Child" : "Children"
                }`);
          } else if (vk === "childrenCount" && ans === 0) {
            ans = "No Child";
          } else if (vk === "childrenCount" && (ans === -2 || ans === -1)) {
            ans = "No Answer";
          }
          if (vk === "profession" && String(ans) === null) {
            ans = "No answer";
          }
          dd.splice(k, 1, { ...dd[k], answer: ans });
        }
      });
    });
    //Setting DefaultOptions if editable content
    if (editable && !isEmpty(defaultOpt)) {
      setDefaultOptions(defaultOpt);
    }
    setDisplayData(dd);
  };

  const setDropDownOptions = () => {
    const eduOpt = find(searchOptions, (o) => o.code === "EDUCATION")?.data;
    setEducationOptions(eduOpt);
    const msOpt = find(searchOptions, (o) => o.code === "MARITAL_STATUS")?.data;
    setMaritalStatusOptions(msOpt);
    const smokeOpt = find(searchOptions, (o) => o.code === "SMOKING")?.data;
    setSmokingOptions(smokeOpt);
    const drinkOpt = find(searchOptions, (o) => o.code === "DRINKING")?.data;
    setDrinkingOptions(drinkOpt);
    const bodyOpt = find(searchOptions, (o) => o.code === "BODY_TYPE")?.data;
    setBodyOptions(bodyOpt);
    const eyeOpt = find(searchOptions, (o) => o.code === "EYE_COLOR")?.data;
    setEyeColorOptions(eyeOpt);
    const hairOpt = find(searchOptions, (o) => o.code === "HAIR_COLOR")?.data;
    setHariColorOptions(hairOpt);
    const relOpt = find(searchOptions, (o) => o.code === "RELIGION")?.data;
    setReligionOptions(relOpt);
    const langProOpt = find(
      searchOptions,
      (o) => o.code === "ENGLISH_PROF"
    )?.data;
    setLangProfOptions(langProOpt);
  };

  const handleSubmit = async (values) => {
    const newData = cloneDeep(data);
    map(values, (v, k) => {
      if (v || v === false) {
        map(data, (vd, kd) => {
          if (k == kd) {
            newData[k] = v;
          }
        });
      }
    });
    let url = `${userData?.userType}s`;
    setBtnLoader(true);
    try {
      const res = await fetchHelper(url, newData, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        Notify("success", "Success!", "Profile details updated successfully");
        onUpdate();
      } else {
        if (res.message || res.Message) {
          Notify("error", "Oops!", res.message || res.Message);
        }
      }
      setBtnLoader(false);
      setModal(false);
    } catch (error) {
      setBtnLoader(false);
      console.log(error);
    }
  };

  const handleFormChanges = (updated) => {
    if (updated === "reset") {
      form.resetFields();
    }
    const country = form.getFieldValue("countryId");
    if (
      isArray(updated) &&
      updated.length > 0 &&
      updated[0].name[0] == "countryId"
    ) {
      if (typeof country === "number") {
        form.setFieldsValue({ cityId: undefined });
        setCityDisabled(false);
      } else {
        setCityDisabled(true);
        form.setFieldsValue({ cityId: "" });
      }
    }
    if (typeof updated === "undefined") {
      if (typeof defaultOptions?.cityId === "number") {
        map(cityList, (v) => {
          if (v.value === defaultOptions.cityId) {
            form.setFieldsValue({ cityId: v.value });
            form.setFieldsValue({ countryId: v.parentId });
          }
        });
        setCityDisabled(false);
      } else {
        form.setFieldsValue({ cityId: undefined });
        setCityDisabled(true);
      }
    }
    setRefresh(false);
  };

  return (
    <>
      <Row className={`rowAboutMe`}>
        <Col span={24} className="contentdataCol">
          <div className="titleIconDiv">
            <span className="spanBtnIcon">
              <Text className="myselfText">About Me</Text>
              {editable ? (
                <span
                  className="roundCircleSpan"
                  onClick={() => setModal(true)}
                >
                  <EditOutlined className="editIcon" />
                </span>
              ) : null}
            </span>
            <Button
              type="link"
              className="siderShowBtn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Less" : "See all"}
            </Button>
          </div>
          {displayData.map((item, index) => {
            if (item.key === "language") {
              // TODO: Check For lanugage variable in API
              return;
            }
            if (
              item.key === "englishProficiency" &&
              data?.user?.userType === "Male"
            ) {
              //Males dont have english proficiency
              return;
            }
            if (!showAll && index > 4) {
              return;
            }
            return (
              <Row className="dataRowAboutMe" key={index}>
                <Text className="titleTextAboutMe">{item.title}:</Text>
                <Text className="aboutmeAnswers" ellipsis={true}>
                  {item.answer}
                </Text>
              </Row>
            );
          })}
        </Col>
      </Row>
      <Modal
        visible={modal}
        footer={false}
        onCancel={() => {
          setModal(false);
          handleFormChanges("reset");
        }}
        zIndex={10}
        className="the_new_class aboutmeModal_class"
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Form
          requiredMark={false}
          form={form}
          onFieldsChange={handleFormChanges}
          name="AboutMeModal"
          onFinish={handleSubmit}
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 12 }}
          initialValues={{ childrenCount: defaultOptions.childrenCount }}
          colon={false}
        >
          <div id="countryArea" style={{ position: "relative" }}>
            <Form.Item
              name="countryId"
              label="Country:"
              className="aboutmeformItem"
            >
              <Select
                placeholder="Your country"
                optionFilterProp="children"
                showSearch
                getPopupContainer={() => document.getElementById("countryArea")}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children
                    .toLowerCase()
                    .localeCompare(optionB.children.toLowerCase())
                }
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
            </Form.Item>
          </div>
          <div id="cityArea" style={{ position: "relative" }}>
            <Form.Item
              name="cityId"
              label={isMobile ? "City:" : "City:"}
              className="aboutmeformItem"
              rules={[
                {
                  required: true,
                  message: "Please select your city",
                },
              ]}
            >
              <Select
                getPopupContainer={() => document.getElementById("cityArea")}
                optionFilterProp="children"
                placeholder="Your city"
                disabled={cityDisabled}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children
                    .toLowerCase()
                    .localeCompare(optionB.children.toLowerCase())
                }
              >
                {filteredCities.map((v) => {
                  return (
                    <Option key={v.value} value={v.value}>
                      {v.label}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            initialValue={data.profession || ""}
            name="profession"
            label="My occupation:"
            className="aboutmeformItem"
            rules={[
              {
                max: 255,
                message: "Maximum 255 characters are allowed",
              },
            ]}
          >
            <Input
              placeholder="Your occupation"
              className="aboutMeModalInput"
            />
          </Form.Item>
          <div id="relationArea" style={{ position: "relative" }}>
            <Form.Item
              initialValue={defaultOptions.maritialStatus}
              name="maritialStatus"
              label="My relationship status:"
              className="aboutmeformItem"
            >
              <Select
                placeholder="Your relationship status"
                getPopupContainer={() =>
                  document.getElementById("relationArea")
                }
              >
                <Option value="No Answer">No answer</Option>
                {maritalStatusOptions.map((val) => {
                  return (
                    <Option value={val.value} key={val.value}>
                      {val.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <div id="kidsArea" style={{ position: "relative" }}>
            <Form.Item
              name="childrenCount"
              label="How many children?"
              className="aboutmeformItem"
            >
              <Select
                optionFilterProp="children"
                placeholder="Select option"
                getPopupContainer={() => document.getElementById("kidsArea")}
              >
                <Option value={-2}>No Answer</Option>
                <Option value="0">No Child</Option>
                {haveChildrens.map((val) => {
                  return (
                    <Option value={val.value} key={val.value}>
                      {val.label}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          {userData.userType === "Female" && (
            <div id="proficiencyArea" style={{ position: "relative" }}>
              <Form.Item
                initialValue={defaultOptions.englishProficiency}
                name="englishProficiency"
                label="My level of English:"
                className="aboutmeformItem"
              >
                <Select
                  getPopupContainer={() =>
                    document.getElementById("proficiencyArea")
                  }
                  optionFilterProp="children"
                  placeholder="Your level of English"
                >
                  <Option value="No Answer">No answer</Option>
                  {langProfOptions.map((val) => {
                    return (
                      <Option value={val.value} key={val.value}>
                        {val.value}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </div>
          )}
          <div id="educationArea" style={{ position: "relative" }}>
            <Form.Item
              initialValue={defaultOptions.education}
              name="education"
              label="My education level:"
              className="aboutmeformItem"
            >
              <Select
                optionFilterProp="children"
                placeholder="Your education level"
                getPopupContainer={() =>
                  document.getElementById("educationArea")
                }
              >
                <Option value="No Answer">No answer</Option>
                {educationOptions.map((val) => {
                  return (
                    <Option value={val.value} key={val.value}>
                      {val.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <div id="religionArea" style={{ position: "relative" }}>
            <Form.Item
              initialValue={defaultOptions.religion}
              name="religion"
              label="My religion:"
              className="aboutmeformItem"
            >
              <Select
                getPopupContainer={() =>
                  document.getElementById("religionArea")
                }
                placeholder="Your religion"
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children
                    .toLowerCase()
                    .localeCompare(optionB.children.toLowerCase())
                }
              >
                <Option value="No Answer">No answer</Option>
                {religionOptions.map((val) => {
                  return (
                    <Option value={val.value} key={val.value}>
                      {val.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <div id="heightArea" style={{ position: "relative" }}>
            <Form.Item
              initialValue={
                defaultOptions.height === 0
                  ? "No answer"
                  : defaultOptions.height
              }
              name="height"
              label="My height:"
              className="aboutmeformItem"
            >
              <Select
                placeholder="Your height"
                getPopupContainer={() => document.getElementById("heightArea")}
              >
                <Option value="0">No answer</Option>
                {height.map((height) => {
                  return (
                    <Option value={height} key={height.toString()}>
                      {displayHeight(height)}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            initialValue={
              defaultOptions.weight === 0 ? null : defaultOptions.weight
            }
            name="weight"
            label="My weight:"
            className="aboutmeformItem"
            rules={[
              {
                type: "number",
                min: 1,
                max: 200,
                message: "Weight must be between 1 to 200 Kg",
              },
            ]}
          >
            <InputNumber
              placeholder="Your weight in KG"
              className="aboutMeModalInput"
            />
          </Form.Item>
          <div id="bodyArea" style={{ position: "relative" }}>
            <Form.Item
              initialValue={defaultOptions.bodyType}
              name="bodyType"
              label="My body type:"
              className="aboutmeformItem"
            >
              <Select
                placeholder="Your body type"
                getPopupContainer={() => document.getElementById("bodyArea")}
              >
                <Option value="No Answer">No answer</Option>
                {bodyOptions.map((val) => {
                  return (
                    <Option value={val.value.toString()} key={val.value}>
                      {val.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <div id="hairArea" style={{ position: "relative" }}>
            <Form.Item
              initialValue={defaultOptions.hairColor}
              name="hairColor"
              label="My hair color:"
              className="aboutmeformItem"
            >
              <Select
                placeholder="Your hair color"
                getPopupContainer={() => document.getElementById("hairArea")}
              >
                <Option value="No Answer">No answer</Option>
                {hariColorOptions.map((val) => {
                  return (
                    <Option value={val.value} key={val.value}>
                      {val.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <div id="eyeArea" style={{ position: "relative" }}>
            <Form.Item
              initialValue={defaultOptions.eyeColor}
              name="eyeColor"
              label="My eye color:"
              className="aboutmeformItem"
            >
              <Select
                placeholder="Your eye color"
                getPopupContainer={() => document.getElementById("eyeArea")}
              >
                <Option value="No Answer">No answer</Option>
                {eyeColorOptions.map((val) => {
                  return (
                    <Option value={val.value} key={val.value}>
                      {val.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <div id="drinkArea" style={{ position: "relative" }}>
            <Form.Item
              initialValue={defaultOptions.alcohol}
              name="alcohol"
              label="Do you drink?"
              className="aboutmeformItem"
            >
              <Select
                placeholder="Drinking"
                getPopupContainer={() => document.getElementById("drinkArea")}
              >
                <Option value="No Answer">No answer</Option>
                {drinkingOptions.map((val) => {
                  return (
                    <Option value={val.value} key={val.value}>
                      {val.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <div id="smokeArea" style={{ position: "relative" }}>
            <Form.Item
              initialValue={defaultOptions.smoking}
              name="smoking"
              label="Do you smoke?"
              className="aboutmeformItem"
            >
              <Select
                placeholder="Smoking"
                getPopupContainer={() => document.getElementById("smokeArea")}
              >
                <Option value="No Answer">No answer</Option>
                {smokingOptions.map((val) => {
                  return (
                    <Option value={val.value} key={val.value}>
                      {val.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            className="aboutmeformItem coverSaveBtnRow"
          >
            <Button
              loading={btnLoader}
              disabled={btnLoader}
              htmlType="submit"
              type="primary"
              size="large"
              className="coverSavetBtn"
            >
              SAVE
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

AboutMe.defaultProps = {
  editable: false,
  data: {},
  onUpdate: () => {},
};

AboutMe.propTypes = {
  editable: PropTypes.bool,
  data: PropTypes.object,
  onUpdate: PropTypes.func,
};

export default AboutMe;
