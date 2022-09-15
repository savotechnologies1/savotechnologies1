import React from "react";
import { Row, Col, Typography } from "antd";
import { featuredData } from "@config/staticData";
const { Text, Paragraph } = Typography;
import "./Services.module.less";

export default function Services() {
  return (
    <Row justify="space-between" className="NewfeaturedRowClass">
      {featuredData.map((item, index) => (
        <Col key={index} xs={24} sm={12} lg={8} xl={4} md={8}>
          <Row justify="center">
            <span className="servicesImgSpanClass">
              <img src={item.img} className="servicesImgClass" />
            </span>
          </Row>
          <Row justify="center">
            <Text className="servicestitleText" level={2}>
              {item.title}
            </Text>
          </Row>
          <Row justify="center">
            <Paragraph
              className="servicesText"
              type="secondary"
              ellipsis={{ rows: 2 }}
            >
              {item.Text}
            </Paragraph>
          </Row>
        </Col>
      ))}
    </Row>
  );
}
