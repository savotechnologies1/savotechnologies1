import React, { useState } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import moment from "moment";
import { useSelector } from "react-redux";
import fetchHelper from "@redux/utils/apiHelper";
import {
  Input,
  Button,
  Form,
  DatePicker,
  Col,
  Typography,
  InputNumber,
  Tooltip,
} from "antd";
import { has, isEmpty } from "lodash";
import { Notify } from "@components";

const { Text } = Typography;

function DateRequestModal(props) {
  let { data, femaleId, statusObj, onUpdate } = props;
  const { token } = useSelector((state) => state.auth);

  const [btnLoader, setBtnLoader] = useState(false);
  const res = statusObj;

  const disabledDate = (current) => {
    if (current < moment()) {
      return true;
    } else {
      return false;
    }
  };

  const onFinish = async (values) => {
    values.femaleUserId = femaleId;
    values.cityId = data.city.id;
    values.dateDate = values.dateDate.format("YYYY-MM-DDTHH:mm:ss[Z]");

    let url = `DateRequests`;
    setBtnLoader(true);
    try {
      const res = await fetchHelper(url, values, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res) && has(res, "status")) {
        onUpdate(res);
      } else {
        if (has(res, "ErrorCode")) {
          Notify(
            "error",
            "Oops!",
            res.Message || res.message || "Something went wrong!"
          );
        }
      }
      setBtnLoader(false);
    } catch (error) {
      setBtnLoader(false);
      console.log(error);
    }
  };

  // dateStatus = "Pending";
  res.status === "Occured";
  return (
    <>
      {res.status === "Pending" ? (
        <Col className="flexBtn">
          <Text className="requestText">
            Your request has successfully is
            <strong className="eligible_strong"> pending for approval. </strong>
          </Text>
          <Text className="requestText">
            Please allow up to 72 hours for the request to be processed. You
            will be notified once the status of the meeting change. You can go
            to
            <Link href="/people/date-request">
              <a> my meeting requests </a>
            </Link>
            to see the status of your request.
          </Text>
        </Col>
      ) : null}

      {res.status === "Approved" ? (
        <Text className="requestText">
          Your meeting request is <Text type="success">approved</Text>, our
          manager will contact you as soon as possible. You will be refunded all
          charges if the lady fails to meet you, but you will be charged in full
          in case you fail to show for your date. However, if both you and the
          lady agree, your meeting may be re-scheduled.
        </Text>
      ) : null}

      {res.status === "Declined" ? (
        <Col className="flexBtn">
          <Text className="requestText">
            Your meeting request is{" "}
            <Tooltip
              placement="top"
              title={`Reason: ${res.declineReason || "-"}`}
            >
              <Text type="danger">declined</Text>,
            </Tooltip>{" "}
            you will be refunded in full.
          </Text>
          <Text className="requestText">
            <strong>Reason:</strong> {res.declineReason || "-"}
          </Text>
          <Button
            type="primary"
            onClick={() => onUpdate({})}
            className="resend_btn"
          >
            Re-send request
          </Button>
        </Col>
      ) : null}

      {res.status === "Rescheduled" ? (
        <Text className="requestText">
          your requests is reschduled go to
          <Link href="/people/date-request">
            <a className="eligible_strong"> meeting requests </a>
          </Link>
          to approve or decline the new rescheduled data
        </Text>
      ) : null}

      {isEmpty(res) || res.status === "Occured" ? (
        <Form
          name="AboutMeModal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
        >
          <Form.Item
            className="aboutmeformItem"
            label="Country"
            name="country"
            initialValue={data.city.country.name || ""}
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            className="aboutmeformItem"
            label="City"
            name="city"
            initialValue={data.city.name || ""}
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            className="aboutmeformItem"
            label="Phone"
            name="phone"
            rules={[
              {
                required: true,
                message: "Please enter a valid phone number",
              },
              {
                type: "number",
                min: 100000,
                max: 999999999999,
                message: "Phone number must be 6 to 12 digits long",
              },
            ]}
          >
            <InputNumber placeholder="Phone" />
          </Form.Item>
          <Form.Item
            className="aboutmeformItem"
            label="Email"
            name="email"
            rules={[
              {
                type: "email",
                required: true,
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            className="aboutmeformItem"
            label="Date"
            name="dateDate"
            rules={[
              {
                required: true,
                message: "Please enter a valid date",
              },
            ]}
          >
            <DatePicker
              inputReadOnly
              dropdownClassName="date_datepicker_class"
              className="aboutmeDatePicker"
              format="YYYY-MM-DD HH:mm a"
              disabledDate={disabledDate}
              showTime={{ defaultValue: moment("00:00:00", "HH:mm a") }}
            />
          </Form.Item>
          <Form.Item
            className="aboutmeformItem"
            label="Restaurant"
            name="restaurant"
            rules={[
              {
                max: 500,
                message: "Maximum upto 500 characters are only allowed",
              },
            ]}
          >
            <Input placeholder="Restaurant" />
          </Form.Item>
          <Form.Item
            className="aboutmeformItem"
            label="Comment"
            name="comment"
            rules={[
              {
                max: 500,
                message: "Maximum upto 500 characters are only allowed",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Comment"
              autoSize={{ minRows: 4, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            className="aboutmeformItem coverSaveBtnRow"
          >
            <Button
              loading={btnLoader}
              disabled={btnLoader}
              htmlType="submit"
              type="primary"
              size="large"
              className="coverSavetBtn"
              style={{ margin: 0, marginBottom: 20 }}
            >
              SEND
            </Button>
          </Form.Item>

          <center>
            <span className="disclaimerText">
              The cost of the service per meeting is 500 credits. First 2 hours
              of translation service is included in the price. In case your
              meeting request is declined, all credits for this request will be
              returned to your account. We strongly recommend not to book or buy
              any tickets or make other arrangements before your meeting is
              confirmed.
            </span>
          </center>
        </Form>
      ) : null}
    </>
  );
}

DateRequestModal.defaultProps = {
  data: {},
  statusObj: {},
  femaleId: "",
  onUpdate: () => {},
};

DateRequestModal.propTypes = {
  data: PropTypes.object,
  statusObj: PropTypes.object,
  femaleId: PropTypes.number,
  onUpdate: PropTypes.func,
};

export default DateRequestModal;
