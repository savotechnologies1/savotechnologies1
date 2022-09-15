import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal } from "antd";
import { isEmpty } from "lodash";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import siteConfig from "@config/siteConfig";
import "./ImageViewer.module.less";

function ImageViewer(props) {
  const { visible, dismiss, activeImage, singleImgPath, imageList } = props;
  const [imgPath, setImgPath] = useState("");
  const [activeIndex, setActiveIndex] = useState(activeImage);
  const myRef = useRef();

  useEffect(() => {
    if (visible) {
      setActiveIndex(activeImage);
      if (isEmpty(imageList)) {
        setImgPath(singleImgPath);
      } else {
        console.log("activeImg, imgleng", activeImage, imageList.length);
        if (activeImage >= 0 && activeImage < imageList.length) {
          setImgPath(
            `${siteConfig.imgUrl}${imageList[activeImage]?.photo?.path}`
          );
        }
      }
    }
  }, [visible, activeImage, imageList]);

  const handleImageClick = (e, type = "") => {
    e.preventDefault();
    let isNext = type === "next";
    let nextIndex = null;
    if (isEmpty(type)) {
      const nativeOffsetX =
        e.nativeEvent && e.nativeEvent.offsetX && e.nativeEvent.offsetX;
      isNext = nativeOffsetX > myRef.current.offsetWidth * 0.5;
    }
    if (isNext) {
      // Next image
      nextIndex = activeIndex + 1;
    } else {
      //Prev image
      nextIndex = activeIndex - 1;
    }
    if (nextIndex >= 0 && nextIndex < imageList.length) {
      setActiveIndex(nextIndex);
      setImgPath(`${siteConfig.imgUrl}${imageList[nextIndex]?.photo?.path}`);
    } else if (nextIndex < 0) {
      setActiveIndex(imageList.length - 1);
      setImgPath(
        `${siteConfig.imgUrl}${imageList[imageList.length - 1]?.photo?.path}`
      );
    } else if (nextIndex == imageList.length) {
      setActiveIndex(0);
      setImgPath(`${siteConfig.imgUrl}${imageList[0]?.photo?.path}`);
    }
  };

  if (imgPath) {
    return (
      <Modal
        className="imageViewerModal"
        visible={visible}
        footer={null}
        zIndex={10}
        closable={true}
        onCancel={() => dismiss()}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Button
          type="link"
          className="leftABtn"
          onClick={(e) => handleImageClick(e, "prev")}
        >
          <LeftOutlined className="arrowIcons" />
        </Button>
        <Button
          type="link"
          className="righAtBtn"
          onClick={(e) => handleImageClick(e, "next")}
        >
          <RightOutlined className="arrowIcons" />
        </Button>
        <img
          src={imgPath}
          className="opendImg"
          onClick={(e) => handleImageClick(e)}
          ref={myRef}
        />
      </Modal>
    );
  } else {
    return <></>;
  }
}

ImageViewer.defaultProps = {
  visible: false,
  imageList: [],
  activeImage: null,
  singleImgPath: "",
  dismiss: () => {},
};

ImageViewer.propTypes = {
  visible: PropTypes.bool,
  imageList: PropTypes.array,
  activeImage: PropTypes.number,
  singleImgPath: PropTypes.string,
  dismiss: PropTypes.func,
};

export default ImageViewer;
