import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Box from "@material-ui/core/Box";
import { Helmet } from "react-helmet";
import { FormattedMessage } from "react-intl.macro";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { useAuthState } from "react-firebase-hooks/auth";
import { FirebaseContext } from "../utils/Firebase";
import { IntlLink } from "./IntlRouter";
import LanguagePicker from "./LanguagePicker";
import Drawer, { DRAWER_WIDTH } from "./Drawer";

const useStyles = makeStyles(theme => ({
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      width: DRAWER_WIDTH,
      visibility: "hidden"
    }
  },
  toolbar: theme.mixins.toolbar,
  drawerPadding: {
    [theme.breakpoints.up("sm")]: {
      marginLeft: DRAWER_WIDTH
    }
  },
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

const useDrawerToggle = () => {
  const [isOpen, setOpen] = React.useState(false);

  return [
    isOpen,
    () => {
      setOpen(!isOpen);
    }
  ];
};

export default function MenuAppBar({ children }) {
  const classes = useStyles();
  const app = useContext(FirebaseContext);
  const [user] = useAuthState(app.auth());
  const [isMobileOpen, mobileToggle] = useDrawerToggle();

  return (
    <>
      <AppBar position="fixed">
        <Helmet
          titleTemplate="Invisible Hands Deliver | %s"
          defaultTitle="Invisible Hands Deliver"
        >
          <html lang="en" />
          <meta charSet="utf-8" />
          {/* <script async defer src="https://buttons.github.io/buttons.js" /> */}
          {/* <link rel="canonical" href="" /> */}
        </Helmet>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={mobileToggle}
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            <IntlLink className={classes.link} to="/">
              <FormattedMessage
                id="app.title"
                defaultMessage="Invisible Hands"
              />
            </IntlLink>
          </Typography>
          <span className={classes.gap} />
          <LanguagePicker />
          <Divider orientation="vertical" light variant="middle" flexItem />
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
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer isMobileOpen={isMobileOpen} mobileToggle={mobileToggle} />
      <div className={classes.toolbar} />
      <Box className={classes.drawerPadding}>{children}</Box>
    </>
  );
}
