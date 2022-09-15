/* eslint-disable import/no-extraneous-dependencies */
import Router from "next/router";
import isObject from "lodash-es/isObject";
import isEmpty from "lodash-es/isEmpty";
import isArray from "lodash-es/isArray";
import siteConfig from "@config/siteConfig";
import AuthActions from "@redux/reducers/auth/actions";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const fetchHelper = (
  url,
  data = {},
  method = "GET",
  headers = defaultHeader,
  formData = false
) => {
  let redStore =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;
  let head = { ...defaultHeader, ...headers };

  if (formData) {
    head = { ...headers };
  }

  // head.Authorization =
  //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Imx1ZmZ5QG1haWxpbmF0b3IuY29tIiwic3ViIjoiMjIiLCJ1c2VyVHlwZSI6Ik1hbGUiLCJuYmYiOjE2MTQwNTc1OTcsImV4cCI6MTcwODY2NTU5NywiaWF0IjoxNjE0MDU3NTk3fQ.-IwYFMqPJYdlwfotv28sf7kU8k2TC-IzM6TsLm4D7Ms";

  let options = {
    method,
    headers: head,
  };
  if (method === "POST" || method === "PUT") {
    options = { ...options, body: formData ? data : JSON.stringify(data) };
  }

  // console.log("API Helper", );

  return fetch(`${siteConfig.apiUrl}${url}`, options)
    .then((res) => {
      if (redStore && [401, 402, 404, 405].includes(res.status)) {
        redStore.dispatch(AuthActions.setResStatus(res.status));
      }
      const newData = res.json().then((detail) => {
        if (detail && detail.message === "Unauthorised") {
          setTimeout(() => {
            Router.push("/");
          }, 1000);
          return Promise.resolve(detail);
        }

        let nData = detail;
        if (isObject(detail) && !isEmpty(detail) && detail.code) {
          const obj = {};
          if (isArray(detail.problems) && detail.problems.length > 0) {
            // eslint-disable-next-line prefer-destructuring
            obj.message = detail.problems[0];
            obj.code = detail.code;
            nData = obj;
          }
        }
        return Promise.resolve(nData);
      });
      return Promise.resolve(newData);
    })
    .catch((error) => Promise.reject(error));
};

export default fetchHelper;
