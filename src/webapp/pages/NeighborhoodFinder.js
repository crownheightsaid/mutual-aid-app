import React, { useState } from "react";
import useAxios from "axios-hooks";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import { useTranslation } from "react-i18next";
import queryString from "query-string";
import QuadrantMap from "webapp/components/QuadrantMap";
import SaveNeighborhoodDataInput from "webapp/components/SaveNeighborhoodDataInput";
import sharedStylesFn from "webapp/style/sharedStyles";

const getError = ({ responseError, responseData, str }) => {
  if (responseError) {
    return (
      <>
        {str("webapp:zoneFinder.geoError.message")}
        &nbsp;
        <a
          href={str("webapp:slack.techChannelUrl")}
          target="_blank"
          rel="noopener noreferrer"
        >
          {str("webapp:slack.techChannel")}
        </a>
      </>
    );
  }

  const addressIsOutsideDeliveryArea =
    responseData && responseData.quadrant === null;
  if (addressIsOutsideDeliveryArea) {
    return str(
      "webapp:zoneFinder.message.reminder",
      `This address is outside of CHMAs delivery area.
            Per our Delivery Area proposal that passed 7/25.
            CHMA cannot make any deliveries outside of this area, no exceptions.`
    );
  }

  return null;
};

const useStyles = makeStyles((theme) => ({
  ...sharedStylesFn(theme),
  mapRoot: {
    flex: 1,
  },
  rootMinimalView: {
    flexDirection: "column",
  },
  formRoot: {
    flex: 1,
  },
  saveNeibDataInput: {
    marginTop: theme.spacing(4),
  },
}));

export default function NeighborhoodFinder() {
  const { t: str } = useTranslation();
  const classes = useStyles();
  const [formAddress, setAddress] = useState("");
  const [{ data, loading, error }, submit] = useAxios(
    {
      url: `/api/geo/address-metadata`,
      method: "post",
    },
    { manual: true } // Don't send on render
  );
  /* eslint-disable camelcase */
  const { minimal_view } = queryString.parse(window.location.search);
  const minimalView = minimal_view === "true";
  /* eslint-enable camelcase */

  const errorStringOrNode = loading
    ? null
    : getError({
        responseError: error,
        responseData: data,
        str,
      });
  const hasError = !!errorStringOrNode;

  const handleSubmit = (event) => {
    event.preventDefault();
    submit({
      data: {
        address: formAddress,
      },
    });
  };

  const EmailButton = () => {
    const subjectString = str(
      "webapp:zoneFinder.email.subject",
      "Covid Resources NYC"
    );
    const resourceLinks = [str("webapp:zoneFinder.email.resourceUrl")];
    let bodyString = str("webapp:zoneFinder.email.body");

    resourceLinks.forEach((resourceLink) => {
      bodyString += `${resourceLink}\n\n`;
    });

    return (
      <>
        <Typography className={classes.text} variant="body1">
          {str(
            "webapp:zoneFinder.sendResources.message",
            "You can use the link below to send more resources if needed!"
          )}
        </Typography>
        <a
          target="_blank"
          className={classes.link}
          rel="noopener noreferrer"
          href={`mailto:?subject=${encodeURIComponent(
            subjectString
          )}&body=${encodeURIComponent(bodyString)}`}
        >
          <Button variant="contained" endIcon={<MailOutlineIcon />}>
            {str("webapp:zoneFinder.sendResources.emailButtonText")}
          </Button>
        </a>
      </>
    );
  };

  return (
    <Box
      className={`${classes.root} ${
        minimalView ? classes.rootMinimalView : ""
      }`}
    >
      <Box className={classes.formRoot}>
        {!minimalView && (
          <Box>
            <Typography className={classes.text} variant="h4">
              {str("webapp:zoneFinder.title", {
                defaultValue: "{{neighborhood}} Neighborhood Finder",
                neighborhood: str("common:neighborhood"),
              })}
            </Typography>
            <Typography className={classes.text} variant="body1">
              {str(
                "webapp:zoneFinder.message.info",
                "Enter an address and we will look up cross streets and the neighborhood."
              )}
            </Typography>
            <Typography className={classes.text} variant="body1">
              {str(
                "webapp:zoneFinder.message.help",
                "For best results, enter street and town (Ex: 1550 dean st brooklyn)"
              )}
            </Typography>
            <Typography className={classes.text} variant="body1">
              {str(
                "webapp:zoneFinder.message.privacy",
                "The address will not be stored or logged :)"
              )}
            </Typography>
          </Box>
        )}
        <form onSubmit={handleSubmit} autoComplete="off">
          <TextField
            id="address"
            name="address"
            label="Address"
            type="text"
            margin="normal"
            variant="outlined"
            required
            onChange={(e) => setAddress(e.target.value)}
            className={classes.field}
            error={hasError}
            helperText={errorStringOrNode}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button aria-label="address-submit" onClick={handleSubmit}>
                    {str("common:submit")}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </form>
        {data && (
          <>
            <TextField
              disabled
              id="cross-1"
              label={str("webapp:zoneFinder.label.crossStreetFirst")}
              value={data.intersection.street_1}
              variant="outlined"
              className={classes.field}
            />
            <TextField
              disabled
              id="cross-2"
              label={str("webapp:zoneFinder.label.crossStreetSecond")}
              value={data.intersection.street_2}
              variant="outlined"
              className={classes.field}
            />
            <TextField
              disabled
              id="neighborhood"
              label={str("webapp:zoneFinder.label.neighborhoodLabel")}
              value={data.neighborhoodName || str("common:notAvailable")}
              helperText={str("webapp:zoneFinder.label.neighborhoodError")}
              variant="outlined"
              className={classes.field}
            />
            <TextField
              disabled
              id="zone"
              label={str("webapp:zoneFinder.label.zone", {
                defaultValue: "{{neighborhood}} Volunteer Zone",
                neighborhood: str("common:neighborhood"),
              })}
              value={data.quadrant || str("common:notAvailable")}
              variant="outlined"
              className={classes.field}
            />

            <SaveNeighborhoodDataInput
              neighborhoodData={data}
              className={`${classes.saveNeibDataInput}`}
            />
          </>
        )}
        {loading && <CircularProgress />}
        <Divider className={classes.divider} />
        <EmailButton />
      </Box>

      <Box className={classes.mapRoot}>
        <QuadrantMap locations={data && [data.location]} />
      </Box>

      {minimalView && (
        <Box>
          <span>{str("webapp:zoneFinder.minimalView.help")}</span>
          <a href="/neighborhood-finder">
            {str("webapp:zoneFinder.minimalView.linkToFullViewText")}
          </a>
        </Box>
      )}
    </Box>
  );
}
