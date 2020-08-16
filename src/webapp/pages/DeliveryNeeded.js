import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import useAxios from "axios-hooks";
import { CircularProgress } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { useTranslation } from "react-i18next";
import sharedStylesFn from "webapp/style/sharedStyles";
import ClusterMap from "webapp/components/ClusterMap";
import DeliveryDialog from "webapp/components/DeliveryDialog";
import Grid from "@material-ui/core/Grid";
import DeliveryTable from "../components/DeliveryTable";
import ClusterMapContext from "../context/ClusterMapContext";
import DeliveryContext from "../context/DeliveryContext";

const useStyles = makeStyles((theme) => ({
  ...sharedStylesFn(theme),
  root: {
    "flex-direction": "row",
    margin: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  wrapper: {
    marginTop: theme.spacing(2),
  },
  mapRoot: {
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
  const [isDialogOpen, setOpen] = useState(false);
  const [requestCode, setRequestCode] = useState();

  const store = {
    isDialogOpen,
    requestCode,
    handleOpenClaimDialog: (code) => {
      setRequestCode(code);
      setOpen(true);
    },
  };

  const [showDrivingRequests, setShowDrivingRequests] = useState(true);
  const [showRegularRequests, setShowRegularRequests] = useState(true);

  const [focusedRequestId, setFocusedRequestId] = useState(null);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Box>{`${error}`}</Box>;
  }

  let tableRowsFeatures = [];

  if (showDrivingRequests) {
    tableRowsFeatures = [
      ...tableRowsFeatures,
      ...data.drivingClusterRequests.features,
    ];
  }

  if (showRegularRequests) {
    tableRowsFeatures = [...tableRowsFeatures, ...data.requests.features];
  }

  const tableRowsMeta = tableRowsFeatures.map((f) => f.properties.meta);

  return (
    <DeliveryContext.Provider value={store}>
      <DeliveryDialog open={isDialogOpen} onClose={() => setOpen(false)} />
      <Box className={classes.root}>
        <Box className={classes.heading}>
          <Typography variant="h4">
            {str("webapp:deliveryNeeded.title", {
              defaultValue: "{{neighborhood}} Delivery Needed",
              neighborhood: str("common:neighborhood"),
            })}
          </Typography>
        </Box>

        <ClusterMapContext.Provider
          value={{ focusedRequestId, setFocusedRequestId }}
        >
          <Grid
            container
            spacing={3}
            direction="row-reverse"
            className={classes.wrapper}
          >
            <Grid item xs={12} md={6}>
              <Box className={classes.mapRoot}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showRegularRequests}
                      onClick={() => setShowRegularRequests(!showRegularRequests)}
                    />
                  }
                  label="Regular requests"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showDrivingRequests}
                      onClick={() => setShowDrivingRequests(!showDrivingRequests)}
                    />
                  }
                  label="Driving cluster requests"
                />
                <ClusterMap
                  showRegularRequests={showRegularRequests}
                  showDrivingRequests={showDrivingRequests}
                  containerStyle={{ height: "550px", width: "100%" }}
                  geoJsonData={data}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className={classes.tableRoot}>
                <DeliveryTable
                  showRegularRequests={showRegularRequests}
                  showDrivingClusters={setShowDrivingRequests}
                  data={data}
                  rows={tableRowsMeta}
                />
              </Box>
            </Grid>
          </Grid>
        </ClusterMapContext.Provider>

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
    </DeliveryContext.Provider>
  );
}