/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Row,
  Col,
  Typography,
  Select,
  Button,
  Avatar,
  message,
  Divider,
} from "antd";
import { ageGroup1, ageGroup2 } from "@config/staticData";
import Images from "@config/images";
import AuthActions from "@redux/reducers/auth/actions";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import "./TopSection.module.less";
import { GLogin } from "@components";
import { useRouter } from "next/router";

const { Title, Text } = Typography;
const { Option } = Select;

export default function TopSection(props) {
  const { onIndexChange } = props;
  const router = useRouter();
  const { setMatchOptions, setRegisterGender } = AuthActions;
  const dispatch = useDispatch();

  const [myGender, setMyGender] = useState(null); // true -> male, false -> female, null -> none
  const [genderBtnHover, setGenderBtnHover] = useState([
    false,
    false,
    false,
    false,
  ]);
  //genderBtnHover Array: 0 -> selected male, 1-> selected female 2-> seeking Male 3-> seeking Female
  const [data, setData] = useState({
    agesFrom: ageGroup1[1],
    agesTo: ageGroup1[3],
  });
  //Register Form Values

  const handleMouseEvent = (index, type) => {
    genderBtnHover[index] = type === "enter";
    setGenderBtnHover([...genderBtnHover]);
  };

  const currentBP = useCurrentScreen();
  const isTab = ["md"].includes(currentBP);
  const isMobile = ["xs"].includes(currentBP);
  return (
    <>
      <Row className="boxRow">
        <Col
          xs={{ span: 24, order: 2 }} //mobile
          md={{ span: 10, order: 1 }} //tablet
          lg={{ span: 10, order: 1 }} //laptop
          xl={{ span: 10, order: 1 }} //pc
          className="boxCol"
        >
          {isTab || isMobile ? null : (
            <Text className="textParagraph" type="secondary">
              Sign up for FREE into a new world where you get noticed for
              who you are, not what you look like or how much money you have.
              We believe love can be found at your next door or thousands of miles away!
              That's why TrueBrides is bringing all of them to your fingertips.
              Because you deserve better!
            </Text>
          )}
          <Col className="headerBtnCol">
            <Title level={4} className="youareText">
              You are...
            </Title>
            <Button
              onMouseEnter={() => handleMouseEvent(0, "enter")}
              onMouseLeave={() => handleMouseEvent(0, "leave")}
              onClick={() => setMyGender(true)}
              type="ghost"
              block
              className={`${
                myGender === true || genderBtnHover[0]
                  ? "headerBtnMaleFemale-active"
                  : "headerBtnMaleFemale"
              }`}
              size="large"
              icon={
                <Avatar
                  shape="square"
                  className="genderButtonAvatar"
                  src={
                    myGender === true || genderBtnHover[0]
                      ? Images.maleAvatarActiveRed
                      : Images.maleUserInactive
                  }
                />
              }
            >
              Male
            </Button>
            <Button
              onMouseEnter={() => handleMouseEvent(1, "enter")}
              onMouseLeave={() => handleMouseEvent(1, "leave")}
              onClick={() => setMyGender(false)}
              type="ghost"
              block
              className={`${
                myGender === false || genderBtnHover[1]
                  ? "headerBtnMaleFemale-active"
                  : "headerBtnMaleFemale"
              }`}
              size="large"
              icon={
                <Avatar
                  shape="square"
                  className="genderButtonAvatar"
                  src={
                    myGender === false || genderBtnHover[1]
                      ? Images.femaleActive
                      : Images.femaleAvatarInactive
                  }
                />
              }
            >
              Female
            </Button>
          </Col>
          <Row justify="center" className="fromToAgeRow">
            <Title level={4} className="agesTitle">
              Looking  for between ages...
            </Title>
            <Row className="selectOptionRow">
              <Select
                value={data.agesFrom}
                onChange={(item) => setData({ ...data, agesFrom: item })}
              >
                {ageGroup1.map((age) => {
                  return (
                    <Option value={age} key={age.toString()}>
                      {age.toString()}
                    </Option>
                  );
                })}
              </Select>
              <span className="lineBetween"></span>
              <Select
                value={data.agesTo}
                onChange={(item) => setData({ ...data, agesTo: item })}
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
          </Row>
          <Row>
            <Button
              type="primary"
              block
              size="large"
              className="takechanceButton"
              onClick={() => {
                if (typeof myGender !== "boolean") {
                  message.info("Please select your gender before continuing!");
                  return;
                }
                dispatch(setRegisterGender(myGender));
                dispatch(
                  setMatchOptions({
                    minAge: Number(data.agesFrom),
                    maxAge: Number(data.agesTo),
                    online: false,
                    verified: false,
                    selectedOptions: [],
                  })
                );
                onIndexChange(2);
              }}
            >
              Find Your Matches
            </Button>
          </Row>
          <Divider style={{ margin: "0px 0px 15px 0px" }}>or</Divider>
          <Row>
            <GLogin myGender={myGender} />
          </Row>
          <Col className="signupGTxt">
            <Text type="secondary">
              By clicking "Sign up via Google" you agree to our{" "}
              <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => router.push(`/links/terms`)}
              >
                Terms
              </span>{" "}
              and{" "}
              <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => router.push(`/links/privacy`)}
              >
                Privacy Policy
              </span>
            </Text>
          </Col>
        </Col>
        <Col
          xs={{ span: 24, order: 1 }}
          md={{ span: 14, order: 2 }}
          lg={{ span: 14, order: 2 }}
          xl={{ span: 14, order: 2 }}
          className="imgCol"
        >
          <img src={Images.heart} className="headerCoupleImg" />
        </Col>
      </Row>
    </>
  );
}
