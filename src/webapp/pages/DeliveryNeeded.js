import React from "react";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import useAxios from "axios-hooks";
import { CircularProgress } from "@material-ui/core";
import { sharedStylesFn } from "../style/sharedStyles";
import ClusterMap from "../components/ClusterMap";

const useStyles = makeStyles(theme => ({
  ...sharedStylesFn(theme),
  mapRoot: {}
}));

export default function DeliveryNeeded() {
  const classes = useStyles();
  const [{ data, loading, error }] = useAxios({
    url: `/api/delivery-required/requests.json`,
    method: "get"
  });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Box>{""+error}</Box>;
  }
  return (
    <Box className={classes.root}>
      <Typography variant="h4">CHMA Delivery Needed</Typography>
      <Box className={classes.mapRoot}>
        <ClusterMap
          containerStyle={{ height: "500px", width: "800px" }}
          geoJsonData={data}
        />
      </Box>
    </Box>
  );
}
