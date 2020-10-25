import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import useAxios from "axios-hooks";
import { CircularProgress } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import sharedStylesFn from "webapp/style/sharedStyles";
import ClusterMap from "webapp/components/ClusterMap";
import DeliveryDialog from "webapp/components/DeliveryDialog";
import HelpText from "webapp/components/DeliveryNeeded/HelpText";
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
  const [{ data, loading, error }, fetchData] = useAxios({
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
      <DeliveryDialog
        open={isDialogOpen}
        onClose={() => setOpen(false)}
        fetchData={fetchData}
      />
      <Box className={classes.root}>
        <Box className={classes.heading}>
          <Typography variant="h4">
            {str("webapp:deliveryNeeded.title", {
              defaultValue: "{{neighborhood}} Delivery Needed",
              neighborhood: str("common:neighborhood"),
            })}
          </Typography>
        </Box>
        <Box marginTop={2}>
          <Typography variant="body1">
            {str("webapp:deliveryNeeded.mapDesc", {
              defaultValue: 'Map of all open requests marked "Delivery Needed"',
            })}
            {str("webapp:deliveryNeeded.description.questions")}
            <a
              mailto={str("webapp:deliveryNeeded.contact.email", {
                defaultValue: "crownheights20@protonmail.com",
              })}
              href={`mailto:${str("webapp:deliveryNeeded.contact.email")}`}
            >
              {str("webapp:deliveryNeeded.contact.email", {
                defaultValue: "crownheights20@protonmail.com",
              })}
            </a>
            {str("webapp:deliveryNeeded.contact.orSlack", {
              defaultValue: " or on Slack at ",
            })}
            <a href={str("webapp:slack.techSupportChannelUrl")}>
              {str("webapp:slack.techSupportChannel")}
            </a>
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
                      // disabling because the linter was contradicting itself
                      // eslint-disable-next-line
                      onClick={() => setShowRegularRequests(!showRegularRequests)}
                    />
                  }
                  label="Regular requests"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showDrivingRequests}
                      // eslint-disable-next-line
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
                <HelpText />
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
      </Box>
    </DeliveryContext.Provider>
  );
}
