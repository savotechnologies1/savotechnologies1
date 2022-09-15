/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { FacebookFilled } from "@ant-design/icons";
import FacebookLogin from "react-facebook-login";
import { has, isEmpty } from "lodash";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { Notify } from "@components";
import AuthActions from "@redux/reducers/auth/actions";
import siteConfig from "@config/siteConfig";
import { useState } from "react";
import { useEffect } from "react";
import fetchHelper from "@redux/utils/apiHelper";
import "./styles.module.less";

function FbLogin() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [appId, setAppId] = useState("2724250107797361");

  useEffect(() => {
    //Call to get Token for Google API
    getAppId();
  }, []);

  const getAppId = async () => {
    let url = `App/Facebook/app-id`;
    try {
      const res = await fetchHelper(url, {}, "GET");
      if (res) {
        setAppId(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fbCallback = (resp) => {
    console.log("===> ~ fbCallback ~ resp", resp, appId);
    if (has(resp, "error") && has(resp.error, "code")) {
      if (resp.error.code > 0) {
        console.log("FB callback Error ==>", resp);
        Notify("error", "Oops!", resp.error.message);
      }
      return;
    }
    return fetch(`${siteConfig.apiUrl}App/Facebook/callback`, {
      method: "POST",
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(resp),
    })
      .then((response) => response.json())
      .then((data) => {
        if (has(data, "authToken") && !isEmpty(data.authToken)) {
          dispatch(AuthActions.setUserData(data.authToken, data));
          router.replace("/people");
        } else {
          console.log("error", data);
          Notify(
            "error",
            "Oops!",
            data.Message || data.message || "Something went wrong"
          );
        }
      });
  };

  return (
    <div className="fbBtnContainer">
      <FacebookLogin
        appId={appId}
        onFailure={(res) => {
          console.log("===> ~ FbLogin ~ status", status);
          if (has(res, "status") && res.status !== "unknown") {
            Notify("error", "Oops!", res.status);
          }
        }}
        fields="name,email,picture,gender,first_name"
        callback={fbCallback}
        cssClass="fbBtn"
        textButton="&nbsp;Signin via Facebook"
        icon={<FacebookFilled />}
      />
    </div>
  );
}

export default FbLogin;
