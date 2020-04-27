import React from "react";
import Box from "@material-ui/core/Box";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

export default function Layout({ children }) {
  const { t: str } = useTranslation();
  return (
    <>
      <Helmet defaultTitle={str("common:appName")}>
        <html lang="en" />
        <meta charSet="utf-8" />
        {/* <script async defer src="https://buttons.github.io/buttons.js" /> */}
        {/* <link rel="canonical" href="" /> */}
      </Helmet>
      <Box>{children}</Box>
    </>
  );
}
