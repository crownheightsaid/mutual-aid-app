import React from "react";
import { Popup } from "react-mapbox-gl";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import CloseIcon from "@material-ui/icons/Close";
import GroupIcon from "@material-ui/icons/Group";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import Chip from "@material-ui/core/Chip";

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    top: 0
  },
  root: {
<<<<<<< HEAD
    position: "relative"
  }
=======
    position: "relative",
  },
  chipRow: {
    "& > *": {
      marginRight: theme.spacing(0.5),
    },
    marginTop: theme.spacing(2),
  },
>>>>>>> mab-open-phones-functions
}));

const RequestPopup = ({ requests, closePopup }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <Popup
      coordinates={requests[0].lngLat}
      offset={{
        "bottom-left": [6, -19],
        bottom: [0, -19],
        "bottom-right": [-6, -19]
      }}
    >
      {requests.map(({ meta }, i) => (
        <Box key={meta.Code} className={classes.root}>
          <CloseIcon
            onClick={closePopup}
            fontSize="small"
            className={classes.closeIcon}
          />
          <Typography variant="h6">
            {meta.slackPermalink ? (
              <Link
                href={meta.slackPermalink}
                underline="always"
                target="_blank"
              >
                {meta["First Name"]}
              </Link>
            ) : (
              meta["First Name"]
            )}
          </Typography>

          <Typography variant="body1">
            {meta["Cross Street #1"]}
            {" and "}
            {meta["Cross Street #2"]}
          </Typography>

<<<<<<< HEAD
          {meta.slackPermalink ? (
            <Link href={meta.slackPermalink} target="_blank">
              {str("webapp:deliveryNeeded.popup.slackLink", {
                defaultValue: `See details on Slack`
              })}
            </Link>
          ) : (
            <Typography variant="body2">
=======
          <Typography variant="body2">
            {str("webapp:deliveryNeeded.popup.requestCode", {
              defaultValue: `Request code:`,
            })}
            {meta.Code}
          </Typography>

          <Box className={classes.chipRow}>
            <Chip
              label={`${meta["Household Size"] || "n/a"}`}
              icon={<GroupIcon />}
              color="secondary"
              size="small"
            />

            {meta["For Driving Clusters"] && (
              <Chip
                label="Driving Cluster"
                icon={<DriveEtaIcon />}
                color="primary"
                size="small"
              />
            )}
          </Box>

          {!meta.slackPermalink && (
            <Typography variant="body2" color="error">
>>>>>>> mab-open-phones-functions
              {str(
                "webapp:deliveryNeeded.popup.cantFindSlack",
                `Can't find Slack link, please search for request code in Slack.`
              )}
            </Typography>
          )}

<<<<<<< HEAD
          <Typography variant="body2">
            {str("webapp:deliveryNeeded.popup.requestCode", {
              defaultValue: `Request code:`
            })}
            {meta.Code}
          </Typography>
=======
>>>>>>> mab-open-phones-functions
          {i !== requests.length - 1 && <Divider className={classes.divider} />}
        </Box>
      ))}
    </Popup>
  );
};

export default RequestPopup;
