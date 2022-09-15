import React, { useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Button, Typography, Form } from "antd";
import { useSelector } from "react-redux";
import fetchHelper from "@redux/utils/apiHelper";
import "./Gifts.module.less";
import { isEmpty, isError } from "lodash";
import { Notify } from "@components";
const { Link, Text } = Typography;

function ContactExchnage(props) {
  let { femaleId, status, eligible, email } = props;
  const { token } = useSelector((state) => state.auth);
  const [click, setClick] = useState(false);
  const [res, setRes] = useState({});
  const [err, setErr] = useState(false);

  const requestApprove = async () => {
    let url = `ContactExchanges`;
    try {
      const res = await fetchHelper(url, { femaleUserId: femaleId }, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res) && res.id) {
        setRes(res);
        setClick(true);
      } else {
        setErr(isError);
      }
    } catch (error) {
      setErr(isError);
      Notify("error", "Oops!", "Something went wrong");
      console.log(error);
    }
  };

  if (res.status) {
    status = res.status;
  }
  if (err) {
    status = false;
  }

  const CreditRender = () => {
    const isEligible = Number(eligible) < 0;
    return (
      <Form name="ContactExchangeForm">
        {isEligible ? (
          <>
            {status === "Pending" ? (
              <Form.Item name="send_request_item">
                <Col className="flexBtn">
                  <Text className="requestText">Your request is pending.</Text>
                  <Text className="Hrs72Text">
                    It may take up to 72 hours to process contact request.
                  </Text>
                </Col>
              </Form.Item>
            ) : null}
            {status === "Approved" ? (
              <Form.Item name="send_email_item">
                <Text className="requestText">
                  Your request is approved. You can send email to lady via{" "}
                  <Link className="mailLink">{email}</Link>
                </Text>
              </Form.Item>
            ) : null}
            {status === "Declined" ? (
              <Form.Item name="send_email_item">
                <Col className="flexBtn">
                  <Text className="requestText">
                    Your request is declined! Please contact the lady before
                    sending another contact request. she might not feed ready!
                  </Text>
                  {!click ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        requestApprove();
                      }}
                    >
                      ASK
                    </Button>
                  ) : null}
                </Col>
              </Form.Item>
            ) : null}
            {!status ? (
              <Form.Item>
                <Col className="flexBtn">
                  {!click ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        requestApprove();
                      }}
                    >
                      ASK
                    </Button>
                  ) : null}
                  <Text>
                    It may take up to 72 hours to process contact request
                  </Text>
                </Col>
              </Form.Item>
            ) : null}
          </>
        ) : (
          <Form.Item name="spend_credit_item">
            <Text className="requestText">
              You need to spend
              <strong className="eligible_strong">{eligible}</strong> more
              credit. Before sending a request.
            </Text>
          </Form.Item>
        )}
      </Form>
    );
  };
  return (
    <>
      <Row justify="center" className="creditRow" align="middle">
        <Col>{<CreditRender />}</Col>
      </Row>
    </>
  );
}

ContactExchnage.defaultProps = {
  femaleId: "",
  status: "",
  email: "",
  eligible: false,
};

ContactExchnage.propTypes = {
  femaleId: PropTypes.number,
  status: PropTypes.string,
  email: PropTypes.string,
  eligible: PropTypes.bool,
};

export default ContactExchnage;
