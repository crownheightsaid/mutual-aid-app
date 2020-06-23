import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  container: {
    maxHeight: 440
  }
});

const DeliveryTable = ({ rows }) => {
  const classes = useStyles();

  return (
    <TableContainer className={classes.container} component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell align="right">Cross Street #1</TableCell>
            <TableCell align="right">Cross Street #2</TableCell>
            <TableCell align="right">First Name</TableCell>
            <TableCell align="right">Slack Link</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeliveryTable;
