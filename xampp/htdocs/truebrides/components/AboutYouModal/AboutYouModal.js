/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Typography,
  Form,
  Input,
  Select,
  Button,
  Modal,
  Upload,
  DatePicker,
} from "antd";
import Images from "@config/images";
import moment from "moment";
import { Notify, StepsCircle } from "@components";
import { has, isArray, isEmpty } from "lodash-es";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import {
  getBase64,
  getMyProfileData,
  uploadPhoto,
  validateImage,
} from "@redux/utils/commonFunctions";
import fetchHelper from "@redux/utils/apiHelper";
import ImgCrop from "antd-img-crop";
import "./AboutYouModal.module.less";
import { useMemo } from "react";

const { Text } = Typography;
const { Option } = Select;
const defaultFormat = "MMMM DD YYYY";
const defaultDatePickerValue = moment().subtract(18, "years").calendar();

function AboutYouModal(props) {
  const [form] = Form.useForm();
  const { visible, dismiss } = props;
  const { userData, token, searchOptions } = useSelector((state) => state.auth);
  const [activeStep, setActiveStep] = useState(1);
  const [cityList, setCityList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [detailsAboutMe, setDetailsAboutMe] = useState("");
  const [idealPartner, setIdealPartner] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [imageToUpload, setImageToUpload] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState([]);
  const [disableNext, setDisableNext] = useState(false);
  const currentBP = useCurrentScreen();
  const isTab = ["md"].includes(currentBP);

  const interestsList = useMemo(() => {
    if (isArray(searchOptions) && !isEmpty(searchOptions)) {
      return searchOptions.find((o) => o.code === "INTERESTS")?.data;
    }
  }, [searchOptions]);

  useEffect(() => {
    if (visible) {
      getCounrties();
    }
  }, [visible]);

  const getCounrties = async () => {
    let url = `Countries/GetDropdown`;
    setLoading(true);
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        setCountryList(res);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const onCountrySelect = async (val) => {
    form.setFieldsValue({ city: "" });
    let url = `Countries/${val}/GetCityDropdown`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res)) {
        setCityList(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const disabledDate = (current) => {
    let start = moment().calendar();
    let end = moment().subtract(18, "years").calendar();
    if (current < moment(start)) {
      return true;
    } else if (current > moment(end)) {
      return true;
    } else {
      return false;
    }
  };

  const handleFormChange = (changedFileds) => {
    let disabled = false;
    if (!isEmpty(changedFileds)) {
      changedFileds.map((o) => {
        if (!isEmpty(o.errors)) {
          disabled = true;
        }
      });
    }
    if (disabled && !disableNext) {
      setDisableNext(true);
    } else if (!disabled && disableNext) {
      setDisableNext(false);
    }
  };

  const handleNext = async (values) => {
    if (activeStep === 1) {
      setFormValues({ ...values });
      setActiveStep(activeStep + 1);
    } else if (activeStep === 2) {
      setFormValues({
        ...formValues,
        interestingDetailsAboutMe: detailsAboutMe,
      });
      setActiveStep(activeStep + 1);
    } else if (activeStep === 3) {
      setFormValues({
        ...formValues,
        idealPartner: idealPartner,
      });
      setActiveStep(activeStep + 1);
    } else if (activeStep === 4) {
      if (!isEmpty(selectedInterests)) {
        setFormValues({
          ...formValues,
          interests: selectedInterests.map((i) => i.value),
        });
      }
      setActiveStep(activeStep + 1);
    } else if (activeStep === 5) {
      if (!isEmpty(profilePic)) {
        uploadProfilePic();
      }
      completeFinish();
    }
  };

  const handleInterest = (option) => {
    const removeIndex = selectedInterests.findIndex((o) => o.id === option.id);
    if (removeIndex === -1) {
      selectedInterests.push(option);
    } else {
      selectedInterests.splice(removeIndex, 1);
    }
    setSelectedInterests([...selectedInterests]);
  };

  const getUpdatedProfileDetails = async () => {
    await getMyProfileData();
  };

  const completeFinish = () => {
    submitUserDetails();
  };

  const uploadProfilePic = async () => {
    setLoading(true);
    try {
      const status = await uploadPhoto(token, imageToUpload, true);
      if (status === "success") {
        getUpdatedProfileDetails();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error =>", error);
    }
  };

  const submitUserDetails = async () => {
    let url = `${userData?.userType}s/Edit`;
    const data = {
      dateOfBirth: formValues.birthDate.format("YYYY-MM-DDTHH:mm:ss[Z]"),
      name: formValues.name,
      cityId: formValues.city,
    };
    if (!isEmpty(formValues.interestingDetailsAboutMe)) {
      data.biography = formValues.interestingDetailsAboutMe;
    }
    if (!isEmpty(formValues.idealPartner)) {
      data.femalePreferences = formValues.idealPartner;
    }
    if (formValues && has(formValues, "interests")) {
      data.interests = formValues.interests;
    }

    try {
      const res = await fetchHelper(url, data, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode")) {
        Notify("success", "Success!", "Profile details updated successfully");
        getUpdatedProfileDetails();
      } else {
        if (res.message) {
          Notify("error", "Oops!", res.message);
        }
      }
      dismiss();
    } catch (error) {
      dismiss();
      console.log(error);
    }
  };

  const handleProfileImage = async (info) => {
    const imageVal = validateImage(info);
    if (imageVal) {
      setImageToUpload(info);
      getBase64(info, (imgUrl) => {
        setProfilePic(imgUrl);
      });
    }
  };

  const firstStep = () => {
    return (
      <Row className="aboutyoumodalrow">
        <Col md={24} xl={18} lg={18} className="aboutyouModalCol">
          <span>
            <Text className="aboutyouText">About You</Text>
          </span>
          <span>
            <Col>
              <Form
                form={form}
                name="AboutForm"
                onFinish={handleNext}
                labelCol={isTab ? { span: 10 } : { span: 7 }}
                wrapperCol={isTab ? { span: 14 } : { span: 17 }}
                initialValues={{
                  name: userData?.name || undefined,
                }}
              >
                <Form.Item
                  label="Name  or nickname"
                  className="formItemName"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter a name",
                    },
                    {
                      max: 25,
                      message: "Maximum 25 characters are allowed",
                    },
                  ]}
                >
                  <Input
                    className="aboutYouModalInput"
                    placeholder="Enter your name or nickname"
                  />
                </Form.Item>
                <div id="dateArea" style={{ position: "relative" }}>
                  <Form.Item
                    name="birthDate"
                    label="Birthdate"
                    className="formItemName"
                    rules={[
                      {
                        required: true,
                        message: "Please select Date of Birth",
                      },
                    ]}
                  >
                    <DatePicker
                      getPopupContainer={() =>
                        document.getElementById("dateArea")
                      }
                      inputReadOnly
                      dropdownClassName="date_datepicker_class"
                      defaultPickerValue={moment(defaultDatePickerValue)}
                      disabledDate={disabledDate}
                      className="aboutYouModalInput"
                      format={defaultFormat}
                    />
                  </Form.Item>
                </div>
                <div id="countryArea" style={{ position: "relative" }}>
                  <Form.Item
                    label="Country"
                    className="formItemName"
                    name="country"
                    rules={[
                      {
                        required: true,
                        message: "Please select your country",
                      },
                    ]}
                  >
                    <Select
                      getPopupContainer={() =>
                        document.getElementById("countryArea")
                      }
                      placeholder="Enter your country"
                      showSearch
                      optionFilterProp="children"
                      onChange={onCountrySelect}
                    >
                      {!isEmpty(countryList) &&
                        countryList.map((v, key) => {
                          return (
                            <Option key={key} value={v.value}>
                              {v.label}
                            </Option>
                          );
                        })}
                    </Select>
                  </Form.Item>
                </div>
                <div id="cityArea" style={{ position: "relative" }}>
                  <Form.Item
                    label="Hometown"
                    className="formItemName"
                    name="city"
                    rules={[
                      {
                        required: true,
                        message: "Please select your city",
                      },
                    ]}
                  >
                    <Select
                      getPopupContainer={() =>
                        document.getElementById("cityArea")
                      }
                      placeholder="Enter your city"
                      disabled={isEmpty(cityList)}
                      showSearch
                      optionFilterProp="children"
                    >
                      {!isEmpty(cityList) &&
                        cityList.map((v) => {
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
                  className="formItemBtnNext"
                  labelCol={{ span: 0 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Button
                    type="primary"
                    size="large"
                    className="modalBtnNext"
                    block
                    htmlType="submit"
                    style={{ marginTop: 40 }}
                  >
                    NEXT
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </span>
        </Col>
      </Row>
    );
  };

  const secondStep = () => {
    return (
      <>
        <Row className="aboutyoumodalrow">
          <Col md={22} lg={20} className="aboutyouModalCol">
            <span>
              <Text className="aboutyouText">
                A little bit more about you...
              </Text>
            </span>
            <span style={{ width: "100%" }}>
              <Row className="aboutTextAreaRow">
                <Form
                  name="interestingAboutMe"
                  onFieldsChange={handleFormChange}
                >
                  <Form.Item
                    name="myForm"
                    rules={[
                      {
                        max: 500,
                        message: "Maximum 500 characters are allowed",
                      },
                    ]}
                  >
                    <Col span={24}>
                      <Input.TextArea
                        placeholder="A little bit more about you..."
                        showCount
                        rows={7}
                        maxLength={500}
                        className="idealPartner"
                        value={detailsAboutMe}
                        onChange={(e) => setDetailsAboutMe(e.target.value)}
                      />
                    </Col>
                  </Form.Item>
                </Form>
              </Row>
            </span>
          </Col>
        </Row>
      </>
    );
  };

  const thirdStep = () => {
    return (
      <>
        <Row className="aboutyoumodalrow">
          <span>
            <Text className="aboutyouText">About your ideal relationship</Text>
          </span>
          <span style={{ width: "100%" }}>
            <Row className="aboutTextAreaRow aboutTextArea">
              <Form name="idealPartner" onFieldsChange={handleFormChange}>
                <Form.Item
                  name="myForm"
                  rules={[
                    {
                      max: 500,
                      message: "Maximum 500 characters are allowed",
                    },
                  ]}
                >
                  <Col span={24}>
                    <Input.TextArea
                      placeholder="A few words about your ideal relationship..."
                      showCount
                      rows={7}
                      maxLength={500}
                      className="idealPartner"
                      value={idealPartner}
                      onChange={(e) => setIdealPartner(e.target.value)}
                    />
                  </Col>
                </Form.Item>
              </Form>
            </Row>
          </span>
        </Row>
      </>
    );
  };

  const fourthStep = () => {
    return (
      <>
        <Row className="aboutyoumodalrow">
          <span>
            <Text className="aboutyouText">Your Hobbies and Interests</Text>
          </span>
        </Row>
        <Row className="interestRow">
          {!isEmpty(interestsList) && interestsList
            ? interestsList.map((item) => {
                const isSelected =
                  selectedInterests.findIndex((o) => o.id === item.id) !== -1;
                return (
                  <Col
                    offset={1}
                    xl={{ offset: 1, span: 7 }}
                    xs={{ offset: 1, span: 11 }}
                    key={item.id}
                  >
                    <div
                      className={`interestsItem ${
                        isSelected && "interestsItem-active"
                      }`}
                      onClick={() => handleInterest(item)}
                    >
                      {!isEmpty(item.description) && (
                        <i
                          className={item.description}
                          aria-hidden="true"
                          style={{ marginRight: 8 }}
                        ></i>
                      )}
                      <Text className={`interestRow${isSelected && "-active"}`}>
                        {item.value}
                      </Text>
                    </div>
                  </Col>
                );
              })
            : null}
        </Row>
      </>
    );
  };

  const fifthStep = () => {
    return (
      <Row className="aboutyoumodalrow">
        <span>
          <Text className="aboutyouText">Add profile photo</Text>
        </span>
        <Row justify="center" align="middle">
          <ImgCrop rotate shape="round">
            <Upload
              className="imgUploader"
              showUploadList={false}
              beforeUpload={handleProfileImage}
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="avatar"
                  className="uploadPhotoBtnImg"
                />
              ) : (
                <>
                  <img
                    src={Images.userModalImgUpload}
                    className="uploadPhotoBtnImg1"
                  />
                  <div className="uploadPhotoBtnText">UPLOAD PROFILE PHOTO</div>
                </>
              )}
            </Upload>
          </ImgCrop>
        </Row>
      </Row>
    );
  };

  if (loading) {
    return <></>;
  }

  return (
    <>
      <Modal
        visible={visible}
        footer={null}
        zIndex={10}
        closable={false}
        className="aboutYouModalClass"
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="mainContainer">
          <>
            <div className="flexDynamicContainer">
              {activeStep === 1 && firstStep()}
              {activeStep === 2 && secondStep()}
              {activeStep === 3 && thirdStep()}
              {activeStep === 4 && fourthStep()}
              {activeStep === 5 && fifthStep()}
            </div>
            <Row justify="center" align="middle" style={{ width: "100%" }}>
              <Col span={24}>
                {[2, 3, 4, 5].includes(activeStep) ? (
                  <div className="footerBtnGrp2 forIdealModal">
                    <Button
                      type="link"
                      className="modalBtnNext"
                      size="large"
                      onClick={() => setActiveStep(activeStep - 1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="primary"
                      block
                      size="large"
                      className="modalBtnNext"
                      onClick={() =>
                        disableNext && activeStep !== 5 ? {} : handleNext()
                      }
                      style={{ width: "50%" }}
                    >
                      {activeStep === 5 ? "COMPLETE" : "NEXT"}
                    </Button>
                    <Button
                      type="link"
                      size="large"
                      className="modalBtnNext"
                      onClick={() => {
                        activeStep === 5
                          ? handleNext()
                          : setActiveStep(activeStep + 1);
                      }}
                    >
                      Skip
                    </Button>
                  </div>
                ) : null}
              </Col>
            </Row>
            <div className="stepsCricleContainer">
              <StepsCircle activeStep={activeStep} totalStep={5} />
            </div>
          </>
        </div>
      </Modal>
    </>
  );
}

AboutYouModal.defaultProps = {
  visible: false,
  dismiss: () => {},
};

AboutYouModal.propTypes = {
  visible: PropTypes.bool,
  dismiss: PropTypes.func,
};

export default AboutYouModal;
