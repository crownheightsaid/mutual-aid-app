import React from "react";
import Chip from "@material-ui/core/Chip";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  recent: {
    backgroundColor: "green",
  },
  moderate: {
    backgroundColor: "orange",
  },
  urgent: {
    backgroundColor: "red",
  },
});

const DaysOpenChip = ({ daysOpen, timeOnly }) => {
  const classes = useStyles();

  let chipColor;

  if (daysOpen < 3) {
    chipColor = classes.recent;
  } else if (daysOpen < 5) {
    chipColor = classes.moderate;
  } else {
    chipColor = classes.urgent;
  }

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
