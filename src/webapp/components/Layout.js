import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { Helmet } from "react-helmet";
import { IntlLink } from "./IntlRouter";
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
          {/* <Divider orientation="vertical" light variant="middle" flexItem />
          <Button color="inherit">
            {user ? (
              <Box
                className={classes.link}
                onClick={() => {
                  app.auth().signOut();
                }}
              >
                <FormattedMessage
                  id="app.nav.logout"
                  defaultMessage="Log Out"
                />
              </Box>
            ) : (
              <IntlLink className={classes.link} to="/login">
                <FormattedMessage id="app.nav.login" defaultMessage="Log In" />
              </IntlLink>
            )}
          </Button> */}
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
      <Box>{children}</Box>
    </>
  );
}
