import React, {useContext} from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import DaysOpenChip from "./DaysOpenChip";
import { daysSinceSlackMessage } from '../helpers/time';
import ClusterMapContext from "../context/ClusterMapContext";

const useStyles = makeStyles({
  container: {
    maxHeight: '90vh',
  },
});

const DeliveryTable = ({ rows }) => {
  const { t: str } = useTranslation();
  const classes = useStyles();
  const { focusedRequestId, setFocusedRequestId } = useContext(ClusterMapContext);

  // sort happens in-place
  rows.sort((rowA, rowB) => rowA.timestamp - rowB.timestamp);

  const formattedRows = rows;

  return (
    <TableContainer className={classes.container} component={Paper}>
    curr request is {focusedRequestId}
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>{str("webapp:zoneFinder.label.code")}</TableCell>
            <TableCell>
              {str("webapp:deliveryNeeded.table.headers.crossStreets", { defaultValue: "Cross streets"})}
            </TableCell>
            <TableCell>
              {str("webapp:zoneFinder.label.firstName")}
            </TableCell>
            <TableCell>
              {str("webapp:zoneFinder.label.slackLink")}
            </TableCell>
            <TableCell>
              {str("webapp:deliveryNeeded.table.headers.daysOpen", { defaultValue: "Days open"})}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formattedRows.map((row) => (
            <TableRow key={row.Code}>
              <TableCell component="th" scope="row">
                {row.Code}
              </TableCell>
              <TableCell>{`${row["Cross Street #1"]} and ${row["Cross Street #2"]}`}</TableCell>
              <TableCell>{row["First Name"]}</TableCell>
              <TableCell>
                <a
                  href={row.slackPermalink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Slack
                </a>
              </TableCell>
              <TableCell><DaysOpenChip timeOnly={true} daysOpen={daysSinceSlackMessage(row.slackTs)} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeliveryTable;
