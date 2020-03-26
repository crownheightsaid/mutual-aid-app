import React, { useContext } from "react";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { useIntl } from "react-intl";
import ListItemText from "@material-ui/core/ListItemText";
import MotorcycleIcon from "@material-ui/icons/Motorcycle";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import PersonIcon from "@material-ui/icons/Person";
import HomeIcon from "@material-ui/icons/Home";
import { useAuthState } from "react-firebase-hooks/auth";
import messages from "../i18n/Messages";
import { IntlLink } from "./IntlRouter";
import { FirebaseContext } from "../utils/Firebase";

export const DRAWER_WIDTH = 260;

const useStyles = makeStyles(theme => ({
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: DRAWER_WIDTH,
      flexShrink: 0
    }
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  link: {
    color: "inherit",
    "&:hover": {
      textDecoration: "none"
    }
  },
  drawerIcon: {
    minWidth: 0
  },
  drawerText: {
    marginLeft: theme.spacing(1.5)
  },
  drawerPaper: {
    width: DRAWER_WIDTH
  }
}));

const DrawerItem = ({ icon, text, route }) => {
  const classes = useStyles();
  return (
    <IntlLink className={classes.link} to={route}>
      <ListItem button>
        <ListItemIcon className={classes.drawerIcon}>{icon}</ListItemIcon>
        <ListItemText className={classes.drawerText} primary={text} />
      </ListItem>
    </IntlLink>
  );
};

export default function DrawerMenu({ container, isMobileOpen, mobileToggle }) {
  const classes = useStyles();
  const theme = useTheme();
  const intl = useIntl();
  const app = useContext(FirebaseContext);
  const [user] = useAuthState(app.auth());
  const assignedRequestRoute = user
    ? `/${user.uid}/assigned-requests`
    : "/login";

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <List>
        <DrawerItem
          icon={<HomeIcon />}
          route="/request"
          text={intl.formatMessage(messages["app.drawer.requestdelivery"])}
        />
        <DrawerItem
          icon={<MotorcycleIcon />}
          route="/open-requests"
          text={intl.formatMessage(messages["app.drawer.makedelivery"])}
        />
        <DrawerItem
          icon={<PersonIcon />}
          route={assignedRequestRoute}
          text={intl.formatMessage(messages["app.drawer.mydeliveries"])}
        />
      </List>
    </div>
  );
  return (
    <nav className={classes.drawer}>
      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor={theme.direction === "rtl" ? "right" : "left"}
          open={isMobileOpen}
          onClose={mobileToggle}
          classes={{
            paper: classes.drawerPaper
          }}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper
          }}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
}
