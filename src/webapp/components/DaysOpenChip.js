import React from "react";
import Chip from "@material-ui/core/Chip";
import { makeStyles } from "@material-ui/core/styles";
import { getUrgencyLevel, urgencyStyles } from "../helpers/map-urgency";

const useStyles = makeStyles(urgencyStyles);

const DaysOpenChip = ({ daysOpen, timeOnly }) => {
  const classes = useStyles();

  const urgencyLevel = getUrgencyLevel(daysOpen);
  const chipColor = classes[urgencyLevel];

  const time = daysOpen <= 0 ? `<1 day` : `${daysOpen} day(s)`;
  const label = timeOnly ? time : `open for ${time}`;

  return (
    <Chip
      label={label}
      color="primary"
      size="small"
      classes={{
        colorPrimary: chipColor,
      }}
    />
  );
};

export default DaysOpenChip;
