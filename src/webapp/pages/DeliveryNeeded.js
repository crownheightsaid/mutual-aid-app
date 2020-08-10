import React from "react";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import useAxios from "axios-hooks";
import { CircularProgress } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { useTranslation } from "react-i18next";
import sharedStylesFn from "webapp/style/sharedStyles";
import ClusterMap from "webapp/components/ClusterMap";
import Grid from "@material-ui/core/Grid";
import DeliveryTable from "../components/DeliveryTable";

const useStyles = makeStyles((theme) => ({
  ...sharedStylesFn(theme),
  root: {
    "flex-direction": "row",
    margin: theme.spacing(4),
  },
  tableRoot: {
    marginTop: theme.spacing(4),
  },
  mapRoot: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
}));

export default function DeliveryNeeded() {
  const classes = useStyles();
  const { t: str } = useTranslation();
  const [{ data, loading, error }] = useAxios({
    url: `/api/delivery-needed/requests.json`,
    method: "get",
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
        <Typography variant="h4">
          {str("webapp:deliveryNeeded.title", {
            defaultValue: "{{neighborhood}} Delivery Needed",
            neighborhood: str("common:neighborhood"),
          })}
        </Typography>
      </Box>
      <Grid container spacing={3} direction="row-reverse">
        <Grid item xs={12} md={6}>
          <Box className={classes.mapRoot}>
            <ClusterMap
              containerStyle={{ height: "550px", width: "100%" }}
              geoJsonData={data}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box className={classes.tableRoot}>
            <DeliveryTable
              rows={data.requests.features.map((f) => f.properties.meta)}
            />
          </Box>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box className={classes.description}>
          <Typography variant="body1">
            {str("webapp:deliveryNeeded.mapDesc", {
              defaultValue:
                'Above is a map of all open requests marked "Delivery Needed"',
            })}
          </Typography>
          <List>
            <ListItem>
              {str("webapp:deliveryNeeded.description.dot", {
                defaultValue: `Each dot represents a location with one or more requests. This
              location is only representative of the cross street data. We do not
              store full addresses.`,
              })}
            </ListItem>
            <ListItem>
              {str("webapp:deliveryNeeded.description.clickDot", {
                defaultValue: `Click on each cluster (large circle with a number) to zoom into
              individual request.`,
              })}
            </ListItem>
            <ListItem>
              {str("webapp:deliveryNeeded.description.popUp", {
                defaultValue: `Click on a dot to pop up details. There is a link to the Slack post
              for more details, where you can also claim the delivery.`,
              })}
            </ListItem>
            <ListItem>
              {str("webapp:deliveryNeeded.description.multipleRequests", {
                defaultValue: `Some dots may represent multiple requests at the same cross-streets.
              Clicking on them will display all of the requests.`,
              })}
            </ListItem>
            <ListItem>
              {str("webapp:deliveryNeeded.description.questions", {
                defaultValue: `Questions or concerns? Please let us know in`,
              })}
              <span>&nbsp;</span>
              <a href={str("webapp:slack.techChannelUrl")}>
                {str("webapp:slack.techChannel")}
              </a>
            </ListItem>
          </List>
        </Box>
      </Grid>
    </Box>
  );
}
