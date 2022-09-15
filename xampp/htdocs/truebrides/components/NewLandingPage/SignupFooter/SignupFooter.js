/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Row, Col, Typography, Button } from "antd";
import "./SignupFooter.module.less";
import GLogin from "@components/GoogleLogin";

const { Text } = Typography;

export default function SignupFooter(props) {
  const { onFindMatch } = props;

  return (
    <>
      <span className="glassEffectSpan"></span>
      <Row justify="center">
        <Col className="glassEffect">
          <span className="signTitleFocus">
            <Text level={3} className="loveText">
              YOU DESERVE<Text className="lovetitle">BETTER</Text>
            </Text>
          </span>
          <Text className="successText">
            Don't be shy and just say hi to the one you liked the most!
          </Text>
          <Row justify="center">
            <GLogin type="footer" />
          </Row>
          <Row justify="center">
            <Text className="orText">or</Text>
          </Row>
          <Row justify="center">
            <Button
              type="primary"
              block
              size="large"
              className="signBtnFooter"
              onClick={() => onFindMatch()}
            >
              Find Your Matches
            </Button>
          </Row>
        </Col>
      </Row>
    </>
  );
}
