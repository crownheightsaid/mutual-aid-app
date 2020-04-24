import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { sharedStylesFn } from "../style/sharedStyles";
import QuadrantMap from "../components/QuadrantMap";
import useAxios from "axios-hooks";

const useStyles = makeStyles(theme => ({
  ...sharedStylesFn(theme),
  mapRoot: {}
}));

export default function DeliveryNeeded() {
  const classes = useStyles();
  const [{ data, loading, error }, submit] = useAxios(
    {
      url: `/api/delivery-required/requests.json`,
      method: "get"
    }
  );
  return (
    <Box className={classes.root}>
      <Typography variant="h4">CHMA Delivery Needed</Typography>
      
      <Box className={classes.mapRoot}>
        <QuadrantMap/>
      </Box>
    </Box>
  );
}
