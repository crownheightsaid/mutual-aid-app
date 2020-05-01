import React from "react";
import { Popup } from "react-mapbox-gl";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";

const RequestPopup = ({ data }) => {
  const { lngLat, meta } = data;
  return (
    <Popup
      coordinates={lngLat}
      offset={{
        "bottom-left": [12, -38],
        bottom: [0, -38],
        "bottom-right": [-12, -38]
      }}
    >
      <Box>
        <Typography variant="h6">{meta["First Name"]}</Typography>
        <Typography variant="body1">
          {meta["Cross Street #1"]}
          {" and "}
          {meta["Cross Street #2"]}
        </Typography>
        <Link href={meta.slackUrl} target="_blank">
          See details on Slack
        </Link>
        <Typography variant="body2">
          Request code:
          {meta.Code}
        </Typography>
      </Box>
    </Popup>
  );
};

export default RequestPopup;
