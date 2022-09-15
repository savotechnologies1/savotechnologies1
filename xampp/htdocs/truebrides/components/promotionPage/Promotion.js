import React, { useState, useEffect, useMemo } from "react";

import { Row, Col, Typography, Button, Skeleton, Grid,div,Modal } from "antd";


import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import fetchHelper from "@redux/utils/apiHelper";
import { isEmpty } from "lodash-es";
import siteConfig from "@config/siteConfig";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";
import AliceCarousel from "react-alice-carousel";

import Images from "@config/images";
import "./Promotion.module.less";
import { Container } from "next/app";




const { Text } = Typography;

export default function Promotion(props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataArr, setDataArr] = useState([]);
  

  const { pIndex, onIndexChange, token } = props;
  const popOverIndex = pIndex;
  
  const signModal = [0, 1, 2].includes(pIndex) || false;


 
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
    let url = `Users/Slider?count=20`;
    setLoading(true);
    try {
      const res = await fetchHelper(url, {}, "GET");

      console.log(res);

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
         <div className="container-img">
        <img
          src={`${siteConfig.imgUrl}${item.picturePath}`}
          className="memberCardImg-pr zoom"
          alt="user" 
          onError={(e) => {
            e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
          }}
        />
          <div className="overlay">
            <div className="text">       
             {item?.name || "-"}  {item.age ? ", " + item.age : "-"}
            </div>
            <button type="button" className="btn chatnowBtn">Chat now</button>
            </div>
            </div> 
        </Col>
      );
    });
  }, [dataArr]);

  const skeletonItems = [...new Array(15)].map((i, ind) => {
    return (
      <Col span={24} key={ind}>
        <div className="item">
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
    <>
    <div className="itemDiv-pr" onClick={() => onIndexChange(0)}>
      <div className="grid2">
      
      <img src="https://images.truebrides.com/images/users/685/OJzV9ZT8HADdoMCZ.jpeg" className="memberCardImg-pr video hide-image1" alt="user" />
          <video className="memberCardImg-pr video"  autoPlay loop muted>
            <source src={Images.demoVideo} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
          <img src="https://images.truebrides.com/images/users/707/jOAGcOFwqDWUAxPH.jpeg" className="memberCardImg-pr video hide-image1" alt="user" />
          <button className="ad">Ad</button>
      </div>

      <div className="grid" onClick={() => onIndexChange(0)}>{items}</div>
    </div>
    <Row className="paginaMainRow" >
       
        <Col
          xs={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 24 }}
          xl={{ span: 24 }}
          className=""
        >
    <div className='col'>
    
      <button className="btnpginate" onClick={() => onIndexChange(0)}>
      <img src="assets/images/pagination.png" className="memberpagination" alt="user" />
      </button>
    {/* <button type="button" className="btn signUnBtn"  onClick={() => onIndexChange(0)}>Join Free Today</button> */}
    </div>
    </Col>
    </Row>

    </>
  );

  
  Promotion.defaultProps = {
    onlyModal: false,
    pIndex: null,
    onIndexChange: () => {},
  };

  }

  

  


