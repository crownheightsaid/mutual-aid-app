import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Box from "@material-ui/core/Box";
import { Helmet } from "react-helmet";
import { IntlLink } from "./IntlRouter";
import LanguagePicker from "./LanguagePicker";
import { isAuthed, removeToken } from "../auth/Auth";

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
  title: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "block"
    }
  },
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
            <IntlLink className={classes.link} to="/">
              Crown Heights Mutual Aid
            </IntlLink>
          </Typography>
          <span className={classes.gap} />
          <LanguagePicker />
          <Divider orientation="vertical" light variant="middle" flexItem />
          <Button color="inherit">
            {isAuthed() ? (
              <Box
                className={classes.link}
                onClick={() => {
                  removeToken();
                }}
              >
                Logout
              </Box>
            ) : (
              <IntlLink
                className={classes.link}
                to="https://crownheightsma.herokuapp.com/auth/slack"
              >
                <img
                  src="https://a.slack-edge.com/accd8/img/sign_in_with_slack.png"
                  alt="sign-in"
                />
              </IntlLink>
            )}
          </Button>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
      <Box>{children}</Box>
    </>
  );
}
