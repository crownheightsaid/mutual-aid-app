import React, { useContext, useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import DaysOpenChip from "./DaysOpenChip";
import { daysSinceSlackMessage } from "../helpers/time";
import ClusterMapContext from "../context/ClusterMapContext";
import HouseholdSizeChip from "./HouseholdSizeChip";
import DrivingClusterChip from "./DrivingClusterChip";

const useStyles = makeStyles((theme) => ({
  container: {
    maxHeight: "90vh",
  },
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
}));

const DeliveryTable = ({ rows }) => {
  const { t: str } = useTranslation();
  const classes = useStyles();
  const { focusedRequestId, setFocusedRequestId } = useContext(
    ClusterMapContext
  );

  useEffect(() => {
    // scroll to focused row
    const row = document.getElementById(focusedRequestId);
    const table = document.getElementById("table-wrapper");

    if (row) {
      const rowRect = row.getBoundingClientRect();
      // only scroll if row is not in view yet
      if (rowRect.top < 0 || rowRect.bottom > window.innerHeight) {
        table.scrollTop = row.offsetTop;
      }
    }
  });

  // sort happens in-place
  rows.sort((rowA, rowB) => rowA.timestamp - rowB.timestamp);

  const formattedRows = rows.map((row) => {
    const isFocused = row.Code === focusedRequestId;

    return {
      ...row,
      isFocused,
    };
  });

  return (
    <TableContainer
      id="table-wrapper"
      className={classes.container}
      component={Paper}
    >
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>
              {str("webapp:deliveryNeeded.table.headers.daysOpen", {
                defaultValue: "Days open",
              })}
            </TableCell>
            <TableCell>{str("webapp:zoneFinder.label.firstName")}</TableCell>
            <TableCell>{str("webapp:zoneFinder.label.code")}</TableCell>
            <TableCell>
              {str("webapp:deliveryNeeded.table.headers.crossStreets", {
                defaultValue: "Cross streets",
              })}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formattedRows.map((row) => (
            <TableRow
              id={row.Code}
              key={row.Code}
              className={row.isFocused ? classes.focused : ""}
              onClick={() => setFocusedRequestId(row.Code)}
            >
              <TableCell>
                <DaysOpenChip
                  timeOnly
                  daysOpen={daysSinceSlackMessage(row.slackTs)}
                />
              </TableCell>
              <TableCell>
                {row["First Name"]}
                <Box className={classes.chipRow}>
                  {row["For Driving Clusters"] && <DrivingClusterChip />}
                  <HouseholdSizeChip size={row["Household Size"]} />
                </Box>
              </TableCell>
              <TableCell component="th" scope="row">
                <Link
                  href={row.slackPermalink}
                  target="_blank"
                  underline="always"
                  rel="noopener noreferrer"
                >
                  {row.Code}
                </Link>
              </TableCell>
              <TableCell>{`${row["Cross Street #1"]} and ${row["Cross Street #2"]}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeliveryTable;
