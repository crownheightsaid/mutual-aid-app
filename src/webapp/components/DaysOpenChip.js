import React from "react";
import Chip from "@material-ui/core/Chip";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import { useTranslation } from "react-i18next";
import { getUrgencyLevel, urgencyStyles } from "../helpers/map-urgency";

const useStyles = makeStyles(() => ({
  ...urgencyStyles,
  tooltip: {
    fontSize: "0.8rem",
  },
}));

function getTime(daysOpen) {
  if (daysOpen < 0) {
    return "n/a";
  }
  if (daysOpen === 0) {
    return "<1 day";
  }

  return `${daysOpen} day(s)`;
}

const getOptionalTooltipTitle = (daysOpen, translateFunction) => {
  if (daysOpen < 0) {
    return translateFunction(
      "webapp:deliveryNeeded.popup.daysOpenNotAvailable",
      {
        defaultValue:
          "This information is not available for some reason. Please reach out to #tech_support on Slack",
      }
    );
  }

  return null;
};

const DaysOpenChip = ({ daysOpen, timeOnly }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  const urgencyLevel = getUrgencyLevel(daysOpen);
  const chipColor = classes[urgencyLevel];

  const time = getTime(daysOpen);
  const label = timeOnly ? time : `open for ${time}`;

  const optionalTooltip = getOptionalTooltipTitle(daysOpen, str);

  const chip = (
    <Chip
      label={label}
      color="primary"
      size="small"
      classes={{
        colorPrimary: chipColor,
      }}
    />
  );

  if (optionalTooltip) {
    return (
      <Tooltip
        title={optionalTooltip}
        classes={{ tooltip: classes.tooltip }}
        arrow
      >
        {chip}
      </Tooltip>
    );
  }

  return chip;
};

export default DaysOpenChip;
