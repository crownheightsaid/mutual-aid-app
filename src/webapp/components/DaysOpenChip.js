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

const DaysOpenChip = (props) => {
  const classes = useStyles();

  let chipColor;

  if (props.daysOpen < 3) {
    chipColor = classes.recent;
  } else if (props.daysOpen < 5) {
    chipColor = classes.moderate;
  } else {
    chipColor = classes.urgent;
  }

  return (
    <Chip
      label={`open for ${props.daysOpen} day(s)`}
      color="primary"
      size="small"
      classes={{
        colorPrimary: chipColor,
      }}
    />
  );
};

export default DaysOpenChip;
