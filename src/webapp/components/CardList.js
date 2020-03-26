import React from "react";

import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "70%"
    }
  }
}));

export default function CardList({ children }) {
  const classes = useStyles();

  return <Box className={classes.root}>{children}</Box>;
}
