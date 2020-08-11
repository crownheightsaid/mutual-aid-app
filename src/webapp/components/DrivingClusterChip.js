import React from "react";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import Chip from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  root: {
    maxWidth: "120px",
  },
}));
const DrivingClusterChip = () => {
  const classes = useStyles();
  return (
    <Tooltip
      title="Marked for driving cluster"
      classes={{ tooltip: classes.noMaxWidth }}
    >
      <Chip
        label="Driving Cluster"
        icon={<DriveEtaIcon />}
        color="primary"
        size="small"
      />
    </Tooltip>
  );
};

export default DrivingClusterChip;
