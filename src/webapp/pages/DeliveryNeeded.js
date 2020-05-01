import React from "react";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import useAxios from "axios-hooks";
import { CircularProgress } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { sharedStylesFn } from "../style/sharedStyles";
import ClusterMap from "../components/ClusterMap";

const useStyles = makeStyles(theme => ({
  ...sharedStylesFn(theme),
  root: {
    "flex-direction": "row",
    margin: theme.spacing(4)
  },
  description: {
    marginTop: theme.spacing(4)
  },
  mapRoot: {
    marginTop: theme.spacing(4)
  }
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
          containerStyle={{ height: "550px", width: "100%" }}
          geoJsonData={data}
        />
      </Box>
      <Box className={classes.description}>
        <Typography variant="body1">
          Above is a map of all open requests marked "Delivery Needed".
        </Typography>
        <List>
          <ListItem>
            Each dot represents a location with one or more requests. This location is only representative of the cross street data. We do not store full addresses.
          </ListItem>
          <ListItem>
            Click on each cluster (large circle with a number) to zoom into
            individual request.
          </ListItem>
          <ListItem>
            Click on a dot to pop up details. There is a link to the Slack post
            for more details, where you can also claim the delivery.
          </ListItem>
          <ListItem>
            Some dots may represent multiple requests at the same cross-streets.
            Clicking on them will display all of the requests.
          </ListItem>
          <ListItem>
            Questions or concerns? Please let us know in <a href="https://crownheightsmutualaid.slack.com/archives/C010AUQ6DFD">
                #tech.
              </a>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}
