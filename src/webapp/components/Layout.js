import React from "react";
import Box from "@material-ui/core/Box";
import { Helmet } from "react-helmet";

export default function MenuAppBar({ children }) {
  return (
    <>
      <Helmet
        titleTemplate="Crown Heights Mutual Aid | %s"
        defaultTitle="Crown Heights Mutual Aid"
      >
        <html lang="en" />
        <meta charSet="utf-8" />
        {/* <script async defer src="https://buttons.github.io/buttons.js" /> */}
        {/* <link rel="canonical" href="" /> */}
      </Helmet>
      <Box>{children}</Box>
    </>
  );
}
