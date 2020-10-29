import React from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import LocalGroceryStoreIcon from "@material-ui/icons/LocalGroceryStore";
import MapIcon from "@material-ui/icons/Map";
import { Link } from "@reach/router";
import { useTranslation } from "react-i18next";
import sharedStylesFn from "../style/sharedStyles";

const useStyles = makeStyles((theme) => ({
  ...sharedStylesFn(theme),

  icon: {
    marginRight: "0.5rem",
  },
  subAppPaperLink: {
    fontSize: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: "hsla(0, 0%, 0%, 0.05)",
    },
  },
}));

export default function HomePage() {
  const { t: str } = useTranslation();
  const classes = useStyles();
  return (
    <Container maxWidth="md" className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={4} className={classes.paper}>
            <Typography variant="h3" component="h1">
              {str("webapp:home.title", {
                defaultValue: "{{neighborhood}} Mutual Aid App",
                neighborhood: "Crown Heights",
              })}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Link to="/neighborhood-finder" className={`${classes.link}`}>
            <Paper
              elevation={4}
              className={`${classes.paper} ${classes.subAppPaperLink}`}
            >
              <MapIcon className={classes.icon} />
              {str("webapp:zoneFinder.genericTitle", {
                defaultValue: "Neighborhood Finder",
              })}
            </Paper>
          </Link>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Link to="/delivery-needed" className={`${classes.link}`}>
            <Paper
              elevation={4}
              className={`${classes.paper} ${classes.subAppPaperLink}`}
            >
              <LocalGroceryStoreIcon className={classes.icon} />
              {str("webapp:deliveryNeeded.genericTitle", {
                defaultValue: "Delivery Needed",
              })}
            </Paper>
          </Link>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={4} className={classes.paper}>
            <Typography variant="h4" component="h1" gutterBottom>
              Contributing
            </Typography>
            <ul>
              <Typography variant="body1">
                <li>
                  <a href="https://crownheightsmutualaid.com/volunteer/">
                    {str("webapp:deliveryNeeded.body.volunteer", {
                      defaultValue: "Get involved with CHMA as a volunteer",
                    })}
                  </a>
                </li>
                <li>
                  {str("webapp:deliveryNeeded.body.contributing", {
                    defaultValue: "Want to contribute? Start here: ",
                  })}
                  <a href="https://github.com/crownheightsaid/mutual-aid-app/blob/master/DEVELOPING.md">
                    DEVELOPING.md
                  </a>
                </li>
              </Typography>
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
