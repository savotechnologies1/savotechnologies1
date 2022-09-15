/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Col, Row, Typography } from "antd";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import "./VideoPlay.module.less";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import Images from "@config/images";

const { Title, Text } = Typography;

export default function VideoPlay() {
  const currentBP = useCurrentScreen();
  const [playVideo, setPlayVideo] = useState(false);
  const isMobile = ["xs"].includes(currentBP);
  return (
    <Row className="videoplayRow">
      <Col
        lg={{ span: 10 }} //laptop
        md={{ span: 10 }} //tablet
        sm={{ span: 10 }}
        xs={{ span: 24 }} //mobile
        xl={{ span: 10 }} //pc
        className="spanPara"
      >
        <Row className="videoWelcomeTextRow">
          <Text className="startWelcomeText">Welcome to</Text>
          <Title level={1} className="startLoveChestTitle">
            TrueBrides
          </Title>
          <span className="spanLoveChest"></span>
        </Row>
        <Row>
          <Title level={4} className="communityText">
            Meaningful Connections.
          </Title>
          <Text className="videoPara" type="secondary">
            TrueBrides isn't just a traditional online dating site. Here you are more than just a photo, it isn't about how cool you like and how many expensive cars you have, you only get noticed for who you are! TrueBrides gives a chance to find people all around the world, and quickly get matched and meet them today! What makes TrueBrides special is that being very selective when choosing their users to promote better dating and increases your chances to match you on what matters to you. Join TrueBrides and don't miss finding out that sometimes it isn't just about what you are looking for but where you are looking for!
          </Text>
        </Row>
      </Col>
      <Col
        lg={{ span: 12 }} //laptop
        md={{ span: 12 }} //tablet
        sm={{ span: 12 }}
        xs={{ span: 24 }} //mobile
        xl={{ span: 12 }} //pc
        className="videocoupleImg"
      >
        {!playVideo ? (
          <span className="glassEffectVideoPlay">
            <Text className="dreamText">TrueBrides: </Text>
            <Text className="dreamText">Best Dating Site</Text>
            <Text className="dreamingText">to Meet Beautiful Singles</Text>
          </span>
        ) : (
          <video className="videoThumb" controls autoPlay>
            <source src={Images.demoVideo} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        )}
        {isMobile ? (
          <>
            {!playVideo ? (
              <span
                className="playIconBtnMobile"
                onClick={() => {
                  !playVideo ? setPlayVideo(true) : setPlayVideo(false);
                }}
              >
                <CaretRightOutlined
                  className="playIconMiddleMobile"
                  onClick={() => {
                    !playVideo ? setPlayVideo(true) : setPlayVideo(false);
                  }}
                />
              </span>
            ) : null}
          </>
        ) : (
          <span
            className="playIconBtn"
            onClick={() => {
              !playVideo ? setPlayVideo(true) : setPlayVideo(false);
            }}
          >
            {!playVideo ? (
              <CaretRightOutlined
                className="playIconMiddleMobile"
                onClick={() => {
                  !playVideo ? setPlayVideo(true) : setPlayVideo(false);
                }}
              />
            ) : (
              <PauseOutlined
                className="playIconMiddleMobile"
                onClick={() => {
                  !playVideo ? setPlayVideo(false) : setPlayVideo(true);
                }}
              />
            )}
          </span>
        )}
      </Col>
    </Row>
  );
}
