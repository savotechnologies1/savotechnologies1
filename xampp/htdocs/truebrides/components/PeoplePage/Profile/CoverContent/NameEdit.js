import React, { useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Button, Input, Form, DatePicker, Col } from "antd";
import { useSelector } from "react-redux";
import { has, isEmpty, map } from "lodash";
import fetchHelper from "@redux/utils/apiHelper";
import { Notify } from "@components";

const defaultFormat = "MMMM DD YYYY";
function NameEdit(props) {
  const { dismiss, name, birthdate } = props;
  const { userData, token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

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

  const onFinish = async (values) => {
    let url = `${userData?.userType}s/Edit`;
    const data = {};
    map(values, (v, k) => {
      if (!isEmpty(v) && v.toString().trim()) {
        data[k] = v;
        if (k === "dateOfBirth") {
          data[k] = v.format("YYYY-MM-DD");
        }
      }
    });
    if (isEmpty(data)) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetchHelper(url, data, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode") && !isEmpty(res)) {
        Notify("success", "Success!", "Profile details updated successfully");
        dismiss(true);
        setLoading(false);
      } else {
        dismiss();
        setLoading(false);
        if (res.message) {
          Notify("error", "Oops!", res.message);
        }
      }
    } catch (error) {
      setLoading(false);
      dismiss();
      console.log(error);
    }
  };

  return (
    <>
      <Col md={23} xl={22}>
        <Form
          name="coverFormModal"
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 12 }}
          onFinish={onFinish}
        >
          <Form.Item
            initialValue={name}
            label="Name or nickname"
            className="nameEditItem"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter your name",
              },
              {
                max: 25,
                message: "Maximum 25 characters are allowed",
              },
            ]}
          >
            <Input placeholder="Name" className="coverModalInput" />
          </Form.Item>
          <Form.Item
            initialValue={moment(birthdate)}
            name="dateOfBirth"
            label="Birthdate"
            className="nameEditItem"
            rules={[
              {
                required: true,
                message: "Please select your birthdate",
              },
            ]}
          >
            <DatePicker
              inputReadOnly
              disabledDate={disabledDate}
              className="aboutmeDatePicker"
              format={defaultFormat}
            />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            className="formSaveBtn"
          >
            <Button
              loading={loading}
              disabled={loading}
              htmlType="submit"
              className="coverSavetBtn"
            >
              SAVE
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </>
  );
}

NameEdit.defaultProps = {
  name: "",
  birthdate: "",
  dismiss: () => {},
};

NameEdit.propTypes = {
  name: PropTypes.string,
  birthdate: PropTypes.string,
  dismiss: PropTypes.func,
};

export default NameEdit;
