/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Modal, Typography } from "antd";
import PropTypes from "prop-types";
import "./HelpCenterModal.module.less";

const { Text } = Typography;

function HelpCenterModal(props) {
  const { dismiss, visible } = props;
  return (
    <Modal
      className="static_pages_modal"
      visible={visible}
      footer={null}
      onCancel={() => dismiss()}
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="class_div">
        <Text className="pages_title">Help Center</Text>
        <Text className="text_pages">
          What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing
          and typesetting industry. Lorem Ipsum has been the industry's standard
          dummy text ever since the 1500s, when an unknown printer took a galley
          of type and scrambled it to make a type specimen book. It has survived
          not only five centuries, but also the leap into electronic
          typesetting, remaining essentially unchanged. It was popularised in
          the 1960s with the release of Letraset sheets containing Lorem Ipsum
          passages, and more recently with desktop publishing software like
          Aldus PageMaker including versions of Lorem Ipsum. Why do we use it?
          It is a long established fact that a reader will be distracted by the
          readable content of a page when looking at its layout. The point of
          using Lorem Ipsum is that it has a more-or-less normal distribution of
          letters, as opposed to using 'Content here, content here', making it
          look like readable English. Many desktop publishing packages and web
          page editors now use Lorem Ipsum as their default model text, and a
          search for 'lorem ipsum' will uncover many web sites still in their
          infancy. Various versions have evolved over the years, sometimes by
          accident, sometimes on purpose (injected humour and the like
        </Text>
      </div>
    </Modal>
  );
}

HelpCenterModal.defaultProps = {
  dismiss: () => {},
  visible: false,
};

HelpCenterModal.propTypes = {
  dismiss: PropTypes.func,
  visible: PropTypes.bool,
};

export default HelpCenterModal;
