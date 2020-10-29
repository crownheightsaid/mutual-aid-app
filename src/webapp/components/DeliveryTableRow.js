import React, { useContext } from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import DaysOpenChip from "./DaysOpenChip";
import ClusterMapContext from "../context/ClusterMapContext";
import HouseholdSizeChip from "./HouseholdSizeChip";
import DrivingClusterChip from "./DrivingClusterChip";
import ClaimDeliveryButton from "./ClaimDeliveryButton";

const useStyles = makeStyles((theme) => ({
  focused: {
    background: theme.palette.grey[100],
  },
  chipRow: {
    display: "block",
    marginTop: theme.spacing(2),
    "& > *": {
      marginRight: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
  },
  expandableRow: {
    marginBottom: theme.spacing(2),
  },
}));

const DeliveryTableRow = (props) => {
  const { row } = props;
  const classes = useStyles();
  const { focusedRequestId, setFocusedRequestId } = useContext(
    ClusterMapContext
  );
  const { t: str } = useTranslation();

  const handleRowClick = (clickedRow) => {
    if (focusedRequestId !== clickedRow.Code) {
      setFocusedRequestId(clickedRow.Code);
    } else {
      setFocusedRequestId("");
    }
  };

  return (
    <>
      <TableRow
        id={row.Code}
        key={row.Code}
        className={row.isFocused ? classes.focused : ""}
        onClick={() => handleRowClick(row)}
      >
        <TableCell>
          <Tooltip
            title={row.isFocused ? "Hide Description" : "Show Description"}
            placement="top"
          >
            <IconButton aria-label="expand row" size="small">
              {row.isFocused ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell>
          <DaysOpenChip timeOnly daysOpen={row.daysOpen} />
        </TableCell>
        <TableCell>{row["Time Sensitivity"] || "Not Stated"}</TableCell>
        <TableCell>
          {row["First Name"]}
          <Box className={classes.chipRow}>
            {row["For Driving Clusters"] && <DrivingClusterChip />}
            <HouseholdSizeChip size={row["Household Size"]} />
          </Box>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.slackPermalink ? (
            <Link
              href={row.slackPermalink}
              target="_blank"
              underline="always"
              rel="noopener noreferrer"
            >
              {row.Code}
            </Link>
          ) : (
            <span>{row.Code}</span>
          )}
        </TableCell>
        <TableCell>{`${row["Cross Street #1"]} and ${row["Cross Street #2"]}`}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={row.isFocused} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="subtitle1" gutterBottom component="div">
                {str("webapp:deliveryNeeded.table.headers.need", {
                  defaultValue: "Need",
                })}
              </Typography>
              <div className={classes.expandableRow}>
                {row.need || "Not Stated"}
              </div>

              <Typography variant="subtitle1" gutterBottom component="div">
                {str("webapp:deliveryNeeded.table.headers.description", {
                  defaultValue: "Description",
                })}
              </Typography>
              <div className={classes.expandableRow}>
                {row["Intake General Notes"] || "N/A"}
              </div>
            </Box>
            <Box margin={1} marginBottom={2}>
              <ClaimDeliveryButton requestCode={row.Code} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default DeliveryTableRow;
