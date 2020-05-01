import React from "react";
import { Popup } from "react-mapbox-gl";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

const RequestPopup = ({ requests }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <Popup
      coordinates={requests[0].lngLat}
      offset={{
        "bottom-left": [12, -38],
        bottom: [0, -38],
        "bottom-right": [-12, -38]
      }}
    >
      {requests.map(({ _, meta }, i) => (
        <Box key={meta.Code}>
          <Typography variant="h6">{meta["First Name"]}</Typography>
          <Typography variant="body1">
            {meta["Cross Street #1"]}
            {" and "}
            {meta["Cross Street #2"]}
          </Typography>
          <Link href={meta.slackUrl} target="_blank">
            {str("webapp:deliveryNeeded.popup.slackLink", {
              defaultValue: `See details on Slack`
            })}
          </Link>
          <Typography variant="body2">
            {str("webapp:deliveryNeeded.popup.requestCode", {
              defaultValue: `Request code:`
            })}
            {meta.Code}
          </Typography>
          {i !== requests.length - 1 && <Divider className={classes.divider} />}
        </Box>
      ))}
    </Popup>
  );
};

export default RequestPopup;
