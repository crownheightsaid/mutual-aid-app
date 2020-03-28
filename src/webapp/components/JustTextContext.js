import React from "react";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { IntlLink } from "./IntlRouter";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "55%"
    }
  },
  text: {
    marginBottom: theme.spacing(3)
  },
  link: {
    color: "black",
    "&:hover": {
      textDecoration: "none"
    }
  }
}));

export default function JustTextContent({
  header,
  body,
  followupRoute,
  followupText
}) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      {header && (
        <Typography className={classes.text} variant="h4">
          {header}
        </Typography>
      )}
      {body && (
        <Typography className={classes.text} variant="body1">
          {body}
        </Typography>
      )}
      {followupRoute && (
        <Button variant="contained" className={classes.text}>
          <IntlLink className={classes.link} to={followupRoute}>
            {followupText || "Click Here"}
          </IntlLink>
        </Button>
      )}
    </Box>
  );
}
