import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles({
  container: {
    maxHeight: 440,
  },
});

const DeliveryTable = ({ rows }) => {
  const { t: str } = useTranslation();
  const classes = useStyles();

  // sort happens in-place
  rows.sort((rowA, rowB) => rowB.timestamp - rowA.timestamp);

  // format data for presentation
  const formattedRows = rows.map((row) => {
    const timestamp = new Date(row.timestamp * 1000);

    return {
      ...row,
      timestamp: `${timestamp.toLocaleDateString()}: ${timestamp.toLocaleTimeString()}`,
    };
  });

  return (
    <TableContainer className={classes.container} component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>{str("webapp:zoneFinder.label.code")}</TableCell>
            <TableCell align="right">
              {str("webapp:zoneFinder.label.crossStreetFirst")}
            </TableCell>
            <TableCell align="right">
              {str("webapp:zoneFinder.label.crossStreetSecond")}
            </TableCell>
            <TableCell align="right">
              {str("webapp:zoneFinder.label.firstName")}
            </TableCell>
            <TableCell align="right">
              {str("webapp:zoneFinder.label.slackLink")}
            </TableCell>
            <TableCell align="right">
              {str("webapp:zoneFinder.label.timestamp")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formattedRows.map((row) => (
            <TableRow key={row.Code}>
              <TableCell component="th" scope="row">
                {row.Code}
              </TableCell>
              <TableCell align="right">{row["Cross Street #1"]}</TableCell>
              <TableCell align="right">{row["Cross Street #2"]}</TableCell>
              <TableCell align="right">{row["First Name"]}</TableCell>
              <TableCell align="right">
                <a
                  href={row.slackPermalink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Slack
                </a>
              </TableCell>
              <TableCell align="right">{row.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeliveryTable;
