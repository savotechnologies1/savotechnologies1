/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Typography, Button, Input, Form } from "antd";
import { has, isEmpty } from "lodash";
import { Notify } from "@components";
import fetchHelper from "@redux/utils/apiHelper";

const { Text } = Typography;

function BioModal(props) {
  const { dismiss, biography } = props;
  const { userData, token } = useSelector((state) => state.auth);
  const [btnLoader, setBtnLoader] = useState(false);

  const onFinish = async (values) => {
    let url = `${userData?.userType}s/Edit`;
    if (isEmpty(values.biography) && isEmpty(values.biography.trim())) {
      return;
    }
    const data = { biography: values.biography.trim() };
    setBtnLoader(true);
    try {
      const res = await fetchHelper(url, data, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode") && !isEmpty(res)) {
        Notify("success", "Success!", "Profile details updated successfully");
        dismiss(true);
        setBtnLoader(false);
      } else {
        dismiss();
        setBtnLoader(false);
        if (res.message) {
          Notify("error", "Oops!", res.message);
        }
      }
    } catch (error) {
      setBtnLoader(false);
      dismiss();
      console.log(error);
    }
  };

  return (
    <Form name="aboutmyselfModalForm" onFinish={onFinish}>
      <Form.Item
        initialValue={biography}
        name="biography"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        rules={[
          {
            required: true,
            message: "Please enter details about you",
          },
          {
            max: 500,
            message: "Maximum 500 characters are allowed",
          },
        ]}
      >
        <Input.TextArea
          placeholder="A little bit more about you..."
          showCount
          rows={7}
          maxLength={500}
          style={{ fontSize: 20 }}
          className="myseldTextAreaClass"
        />
      </Form.Item>
      <Form.Item className="saveBtnFormItem">
        <Button
          loading={btnLoader}
          disabled={btnLoader}
          className="coverSavetBtn"
          htmlType="submit"
        >
          SAVE
        </Button>
      </Form.Item>
    </Form>
  );
}

BioModal.defaultProps = {
  biography: "",
  dismiss: () => {},
};

BioModal.propTypes = {
  biography: PropTypes.string,
  dismiss: PropTypes.func,
};

export default BioModal;
