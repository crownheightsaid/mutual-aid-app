import React from "react";
import GroupIcon from "@material-ui/icons/Group";
import Chip from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: "120px",
  },
}));
const HouseholdSizeChip = ({ size }) => {
  const classes = useStyles();
  return (
    <Tooltip
      title={`Household size: ${size || "n/a"}`}
      classes={{ tooltip: classes.noMaxWidth }}
    >
      <Chip
        className={classes.root}
        label={`${size || "n/a"}`}
        icon={<GroupIcon />}
        color="default"
        size="small"
      />
    </Tooltip>
  );
};

export default HouseholdSizeChip;
