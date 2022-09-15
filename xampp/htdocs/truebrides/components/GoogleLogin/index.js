/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, message } from "antd";
import { has, isEmpty } from "lodash";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { Notify } from "@components";
import AuthActions from "@redux/reducers/auth/actions";
import GoogleLogin from "react-google-login";
import Images from "@config/images";
import { useEffect } from "react";
import fetchHelper from "@redux/utils/apiHelper";
import "./styles.module.less";

function GLogin(props) {
  const { myGender, type } = props;
  const router = useRouter();
  const dispatch = useDispatch();

  const [googleClientId, setGoogleClientId] = useState(
    "454375248357-oqrt2r9d3k1cb66goq3nncn6j0glfcqd.apps.googleusercontent.com"
  );

  useEffect(() => {
    //Call to get Token for Google API
    getGoogleClientId();
  }, []);

  const getGoogleClientId = async () => {
    let url = `App/Google/client-id`;
    try {
      const res = await fetchHelper(url, {}, "GET");
      if (res) {
        setGoogleClientId(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const callback = async (googleResponse) => {
    let url = `App/Google/callback?code=${googleResponse.code}&gender=${
      myGender ? "Male" : "Female"
    }`;
    try {
      const res = await fetchHelper(url, {}, "POST");
      if (has(res, "authToken") && !isEmpty(res.authToken)) {
        dispatch(AuthActions.setUserData(res.authToken, res));
        router.replace("/people");
      } else {
        if (res.message || res.Message) {
          Notify("error", "Oops!", res.message || res.Message);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <GoogleLogin
      clientId={googleClientId}
      buttonText="Sign in via Google"
      render={(renderProps) => (
        <>
          <Button
            onClick={() => {
              if (typeof myGender !== "boolean" && type !== "footer") {
                message.info("Please select your gender before continuing!");
                return;
              }
              renderProps.onClick();
            }}
            disabled={renderProps.disabled}
            block
            size="large"
            className={type === "footer" ? "signBtnFooter" : "googleLoginBtn"}
            icon={
              <span>
                <img src={Images.googlelogo} className="googleBtnLogo" />
              </span>
            }
          >
            <span className="signInGText">Sign up via Google</span>
          </Button>
        </>
      )}
      onSuccess={callback}
      onFailure={(resp) => {
        console.log(resp);
      }}
      cookiePolicy={"single_host_origin"}
      responseType="code"
    />
  );
}

GLogin.defaultProps = {
  myGender: true,
  type: "top",
};

GLogin.propTypes = {
  myGender: PropTypes.bool,
  type: PropTypes.string,
};

export default GLogin;
