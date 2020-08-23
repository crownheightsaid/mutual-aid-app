import React, { useContext, useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import ClusterMapContext from "../context/ClusterMapContext";
import DeliveryTableRow from "./DeliveryTableRow";

const useStyles = makeStyles((theme) => ({
  container: {
    maxHeight: "90vh",
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

  const renderTableHeadRow = () => {
    return (
      <TableRow>
        <TableCell></TableCell>
        <TableCell>
          {str("webapp:deliveryNeeded.table.headers.daysOpen", {
            defaultValue: "Days open",
          })}
        </TableCell>
        <TableCell>
          {str("webapp:deliveryNeeded.table.headers.timeSensitivity", {
            defaultValue: "Time Sensitivity",
          })}
        </TableCell>
        <TableCell>
          {str("webapp:deliveryNeeded.table.headers.neighbor", {
            defaultValue: "Neighbor",
          })}
        </TableCell>
        <TableCell>{str("webapp:zoneFinder.label.code")}</TableCell>
        <TableCell>
          {str("webapp:deliveryNeeded.table.headers.crossStreets", {
            defaultValue: "Cross streets",
          })}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableContainer
      id="table-wrapper"
      className={classes.container}
      component={Paper}
    >
      <Table aria-label="simple table">
        <TableHead>
          {renderTableHeadRow()}
        </TableHead>
        <TableBody> 
          {
            formattedRows.map((row) => 
            (<DeliveryTableRow row={row} key={row.code} />))
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeliveryTable;
