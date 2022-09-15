/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Row, Col, Typography, Layout, Card, Carousel } from "antd";
import Images from "@config/images";
import { blogStaticCardSlide1, blogStaticCardSlide2 } from "@config/staticData";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import "./SingleBlog.module.less";

const { Text } = Typography;

export default function SingleBlog() {
  const currentBP = useCurrentScreen();
  const showIcons = ["xs"].includes(currentBP);

  return (
    <Layout className="blogLayout">
      <Row className="blogRow">
        <Col className="blogCol">
          <Text className="blogTitle">TrueBrides Blog</Text>
          <span className="spanBlogDesh"></span>
        </Col>
      </Row>
      <>
        {showIcons ? (
          <Carousel>
            <div>
              <Card
                cover={<img src={Images.blogimage1} className="cardImgStyle" />}
                bodyStyle={{ padding: "10px" }}
                className="blogCardIsMobile"
              >
                <Text className="blogTitleText">
                  WHAT IF I AM NOT LOOKING FOR MARRIAGE?
                </Text>
                <Text className="biosmallText">
                  There is no restriction to look only for a bride or marriage. We also welcome people who have different preferences when it comes to relationships.
                </Text>
              </Card>
            </div>
            <div>
              <Card
                cover={<img src={Images.blogimage2} className="cardImgStyle" />}
                bodyStyle={{ padding: "10px" }}
                className="blogCardIsMobile"
              >
                <Text className="blogTitleText">
                  DO I HAVE TO TRAVEL TO UKRAINE OR RUSSIA?
                </Text>
                <Text className="biosmallText">
                  TrueBrides has users from many different countries as well as from the United States. You can use the search filter to find a date that suits you the most.
                </Text>
              </Card>
            </div>
          </Carousel>
        ) : (
          <Carousel>
            <div>
              <Col className="divblogclass">
                {blogStaticCardSlide1.map((item, key) => {
                  return (
                    <Col xs={24} sm={12} lg={7} xl={7} md={13} key={key}>
                      <Card
                        className="blogCard"
                        cover={<img src={item.img} className="cardImgStyle" />}
                        bodyStyle={{ padding: "20px 15px" }}
                      >
                        <Col className="titleBioCol">
                          <Text className="blogTitleText">{item.title}</Text>
                          <Text className="biosmallText">{item.bio}</Text>
                        </Col>
                      </Card>
                    </Col>
                  );
                })}
              </Col>
            </div>
            <div>
              <Col className="divblogclass">
                {blogStaticCardSlide2.map((item, key) => {
                  return (
                    <Col key={key} xs={24} sm={12} lg={7} xl={7} md={13}>
                      <Card
                        className="blogCard"
                        cover={<img src={item.img} className="cardImgStyle" />}
                        bodyStyle={{ padding: "20px 15px" }}
                      >
                        <Col className="titleBioCol">
                          <Text className="blogTitleText">{item.title}</Text>
                          <Text className="biosmallText">{item.bio}</Text>
                        </Col>
                      </Card>
                    </Col>
                  );
                })}
              </Col>
            </div>
          </Carousel>
        )}
      </>
    </Layout>
  );
}
