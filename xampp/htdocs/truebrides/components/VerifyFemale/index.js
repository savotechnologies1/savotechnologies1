import React, { useEffect, useState } from "react";
import { Row, Col, Typography } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import "./VerifyFemale.module.less";
import useCurrentScreen from "@redux/utils/useCurrentScreen";

const { Text } = Typography;

function VerifyFemale() {
  const currentBP = useCurrentScreen();
  const [startOffset, setStartOffset] = useState(5);

  useEffect(() => {
    if (["xxl"].includes(currentBP)) {
      setStartOffset(5);
    } else if (["xl"].includes(currentBP)) {
      setStartOffset(6);
    } else if (["lg"].includes(currentBP)) {
      setStartOffset(6);
    } else if (["md"].includes(currentBP)) {
      setStartOffset(0);
    } else {
      setStartOffset(0);
    }
  }, [currentBP]);

  return (
    <Row className="fullW" justify="center" align="middle">
      <Col
        xs={24}
        sm={20}
        md={15}
        lg={14}
        xl={12}
        offset={startOffset}
        className="verifyCol"
      >
        <Text className="verifyMainTitle" type="secondary">
          Your membership application is successfully submitted.
        </Text>
        <CheckCircleFilled className="tickIcon" />
        <div className="centerTxtDiv">
          <Text className="verifyMainTitle" type="secondary">
            Your can start to use our services after your membership is approved
            by our moderators
          </Text>
          <Text className="verifyMainTitle marginTopTxt" type="secondary">
            If more information is required, you will be contacted via email
            that you used during registration
          </Text>
        </div>
        <div className="supportDiv">
          <Text className="verifyMainTitle" type="secondary">
            Thank you for your patience.
          </Text>
          <Text className="verifyMainTitle marginTopTxt" type="secondary">
            TrueBrides Support Team
          </Text>
        </div>
      </Col>
    </Row>
  );
}
export default VerifyFemale;
