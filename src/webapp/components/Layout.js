import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { Helmet } from "react-helmet";
import LanguagePicker from "./LanguagePicker";

const useStyles = makeStyles(theme => ({
  toolbar: theme.mixins.toolbar,
  link: {
    color: "white",
    "&:hover": {
      textDecoration: "none"
    }
  },
  language: {
    margin: theme.spacing(0, 0.5, 0, 1)
  },
  title: {},
  gap: {
    flexGrow: 1
  }
}));

export default function MenuAppBar({ children }) {
  const classes = useStyles();

  return (
    <>
      <AppBar position="fixed">
        <Helmet
          titleTemplate="Crown Heights Mutual Aid | %s"
          defaultTitle="Crown Heights Mutual Aid"
        >
          <html lang="en" />
          <meta charSet="utf-8" />
          {/* <script async defer src="https://buttons.github.io/buttons.js" /> */}
          {/* <link rel="canonical" href="" /> */}
        </Helmet>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Volunteer Helper
          </Typography>
          <span className={classes.gap} />
          <LanguagePicker />
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
      <Box>{children}</Box>
    </>
  );
}
