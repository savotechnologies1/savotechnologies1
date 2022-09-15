/* eslint-disable react/prop-types */
import React from "react";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";
import Images from "@config/images";

function CImg(props) {
  const { alt, src } = props;
  return (
    <LazyLoad once>
      <img
        {...props}
        alt={alt}
        src={src}
        onError={(e) => {
          e.currentTarget.src = Images.userModalImgUpload;
        }}
        style={{ height: "100%", width: "100%" }}
      />
    </LazyLoad>
  );
}

CImg.propTypes = {
  alt: PropTypes.string,
};
CImg.defaultProps = {
  alt: "default text",
};
export default CImg;
