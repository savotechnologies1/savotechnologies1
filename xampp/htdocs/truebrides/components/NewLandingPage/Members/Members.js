import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Typography, Button, Skeleton } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import fetchHelper from "@redux/utils/apiHelper";
import { isEmpty } from "lodash-es";
import siteConfig from "@config/siteConfig";
import LazyLoad from "react-lazyload";
import AliceCarousel from "react-alice-carousel";
import "./Members.module.less";

const { Text } = Typography;

export default function Members() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataArr, setDataArr] = useState([]);

  useEffect(() => {
    getSliderData();
  }, []);

  const responsive = {
    1366: {
      items: 5,
    },
    1240: {
      items: 4,
    },
    959: {
      items: 3,
    },
    580: {
      items: 2,
    },
    425: {
      items: 1,
    },
    321: {
      items: 1,
    },
    220: {
      items: 1,
    },
    0: {
      items: 0,
    },
  };

  const onSlideChanged = ({ item }) => setActiveIndex(item);

  const getSliderData = async () => {
    let url = `Users/Slider?count=10`;
    setLoading(true);
    try {
      const res = await fetchHelper(url, {}, "GET");
      if (!isEmpty(res)) {
        setDataArr(res);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const items = useMemo(() => {
    return dataArr.map((item, key) => {
      return (
        <Col span={24} key={key}>
          <div className="memberCard">
            <LazyLoad>
              <img
                src={`${siteConfig.imgUrl}${item.picturePath}`}
                className="memberCardImg"
                alt="user"
                onError={(e) => {
                  e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                }}
              />
            </LazyLoad>
            <Row className="memberName">
              <txt className="name">{item?.name || "-"}</txt>
              <span className="age">{item.age ? ", " + item.age : "-"}</span>
            </Row>
            <Text className="memberLocation" type="secondary">
              {item?.city || ""} , {item?.country || ""}
            </Text>
          </div>
        </Col>
      );
    });
  }, [dataArr]);

  const skeletonItems = [...new Array(15)].map((i, ind) => {
    return (
      <Col span={24} key={ind}>
        <div className="memberCard">
          <Skeleton.Button
            className="cardSkeleton"
            shape="square"
            active
            loading
          />
          <Skeleton paragraph={{ rows: 1 }} size="small" active loading />
        </div>
      </Col>
    );
  });

  if (isEmpty(dataArr) && !loading) {
    return <></>;
  }

  return (
    <div>
      <Col span={24} className="mainDiv">
        <Row wrap={false} className="memRow">
          <Col className="itemDiv" offset={4} span={16}>
            <AliceCarousel
              infinite
              autoPlay
              autoPlayInterval={4000}
              disableDotsControls
              autoPlayDirection="ltr"
              activeIndex={activeIndex}
              onSlideChanged={onSlideChanged}
              items={loading ? skeletonItems : items}
              responsive={responsive}
              renderPrevButton={() => {
                return (
                  <Button type="link" className="arrowbtn leftBtn">
                    <LeftOutlined className="leftArrowBtnIcon" />
                  </Button>
                );
              }}
              renderNextButton={() => {
                return (
                  <Button type="link" className="arrowbtn rightBtn">
                    <RightOutlined className="rightArrowBtnIcon" />
                  </Button>
                );
              }}
            />
          </Col>
        </Row>
      </Col>
    </div>
  );
}
