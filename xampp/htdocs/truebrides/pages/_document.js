import React from "react";
import Images from "@config/images";
import Document, { Head, Main, NextScript, Html } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.3/css/fontawesome.min.css"
            integrity="sha384-wESLQ85D6gbsF459vf1CiZ2+rr+CsxRY0RpiF1tLlQpDnAgg6rwdsUF1+Ics2bni"
            crossOrigin="anonymous"
          />
          <script
            src="https://kit.fontawesome.com/818ce17794.js"
            crossOrigin="anonymous"
          ></script>
          <link
            rel="stylesheet"
            as="style"
            href="https://fonts.googleapis.com/css2?family=Prata&display=swap"
            crossOrigin="true"
          />
          <link
            rel="stylesheet"
            as="style"
            href="https://fonts.googleapis.com/css2?family=Mulish:wght@200&display=swap"
            crossOrigin="true"
          />
      
          <link rel="icon" type="image/png" href={Images.fevicon} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
