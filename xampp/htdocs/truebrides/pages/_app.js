import Images from "@config/images";
import React, { useEffect } from "react";
import { useStore } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { wrapper } from "../redux/store/configureStore";
import { setI18nConfig } from "../lang/Translate";
import "antd/dist/antd.less";



const App = ({ Component, pageProps }) => {
  const store = useStore((state) => state);

  useEffect(() => {
    setI18nConfig();
  }, []);

  const LoadingHearts = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <img src={Images.loadingHearts} width="100px" />
      </div>
    );
  };
  return (
    <PersistGate persistor={store.__persistor} loading={<LoadingHearts />}>
      <Component {...pageProps} />
    </PersistGate>
  );
};

App.getInitialProps = async ({ Component, ctx }) => {
  // Keep in mind that this will be called twice on server, one for page and second for error page
  ctx.store.dispatch({ type: "APP", payload: "was set in _app" });
  return {
    pageProps: {
      // Call page-level getInitialProps
      ...(Component.getInitialProps
        ? await Component.getInitialProps(ctx)
        : {}),
      // Some custom thing for all pages
      appProp: ctx.pathname,
    },
  };
};

export default wrapper.withRedux(App);
