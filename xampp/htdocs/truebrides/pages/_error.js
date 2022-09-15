/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Head from "next/head";
import { Row, Typography, Button } from "antd";
import Images from "@config/images";
import "../components/NoDataFound/nodata.module.less";
import { useRouter } from "next/router";

const { Text } = Typography;

function Error() {
  const router = useRouter();

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>Find Hot Russian Girls on TrueBrides.com - Enjoy online dating with Russian and Ukrainian Brides!</title>
      </Head>
      <Row justify="center" className="fullContainer">
        <img
          src={Images.loadingHearts}
          alt="No result to show"
          className="imgStyle"
        />
        <Text type="secondary" className="h4">
          Oops! Page Not Found
        </Text>
        <Text type="secondary" className="h4">
          The page you were looking for might have been removed, or did not
          exist in the first page
        </Text>
        <div>
          <Button
            type="primary"
            size="large"
            onClick={() => router.replace("/")}
            className="homeGoBtn"
          >
            Go to Homepage
          </Button>
        </div>
      </Row>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
