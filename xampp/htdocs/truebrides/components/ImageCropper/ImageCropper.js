import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "antd";
import "./ImageCropper.module.less";
import Cropper from "react-easy-crop";

function ImageCropper(props) {
  const { visible, dismiss, image } = props;
  const [cropState, setCropState] = useState({ x: 0, y: 0 });
  const [img, setImg] = useState(image);

  useEffect(() => {
    if (visible) {
      setImg(image);
    }
  }, [visible, image]);

  const handleOk = () => {
    console.log("img==>", img);
  };

  const handleClose = () => {
    dismiss();
  };

  return (
    <Modal
      className="cropperModal"
      title="Edit Image"
      visible={visible}
      onOk={handleOk}
      onCancel={handleClose}
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="croperDiv">
        <Cropper
          cropShape="round"
          image={img}
          crop={cropState}
          onCropChange={(c) => setCropState(c)}
        />
      </div>
    </Modal>
  );
}

ImageCropper.defaultProps = {
  visible: false,
  dismiss: () => {},
  image: "",
};

ImageCropper.propTypes = {
  visible: PropTypes.bool,
  dismiss: PropTypes.func,
  image: PropTypes.string.isRequired,
};

export default ImageCropper;
