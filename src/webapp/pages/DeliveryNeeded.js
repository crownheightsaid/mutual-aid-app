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
  root: {
    'flex-direction': 'row',
    margin: theme.spacing(4)
  },
  mapRoot: {
    marginTop: theme.spacing(4)
  },
}));

export default function DeliveryNeeded() {
  const classes = useStyles();
  const [{ data, loading, error }] = useAxios({
    url: `/api/delivery-needed/requests.json`,
    method: "get"
  });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Box>{`${error}`}</Box>;
  }
  return (
    <Box className={classes.root}>
      <Box className={classes.heading}>
        <Typography variant="h4">CHMA Delivery Needed</Typography>
      </Box>
      <Box className={classes.mapRoot}>
        <ClusterMap
          containerStyle={{ height: "500px", width: "800px" }}
          geoJsonData={data}
        />
      </Box>
    </Box>
  );
}
