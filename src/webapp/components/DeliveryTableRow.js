import React, { useContext } from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { makeStyles } from "@material-ui/core/styles";
import DaysOpenChip from "./DaysOpenChip";
import { daysSinceSlackMessage } from "../helpers/time";
import ClusterMapContext from "../context/ClusterMapContext";
import HouseholdSizeChip from "./HouseholdSizeChip";
import DrivingClusterChip from "./DrivingClusterChip";

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
  description: {
    marginBottom: theme.spacing(2),
  }
}));

const DeliveryTableRow = (props) => {
  const row = props.row;
  const classes = useStyles();
  const { focusedRequestId, setFocusedRequestId } = useContext(
    ClusterMapContext
  );

  const handleRowClick = row => {
    if (focusedRequestId !== row.Code) {
      setFocusedRequestId(row.Code);
    } else {
      setFocusedRequestId("");
    }
  }

  return (
    <React.Fragment>
      <TableRow
        id={row.Code}
        key={row.Code}
        className={row.isFocused ? classes.focused : ""}
        onClick={() => handleRowClick(row)}
      >
        <TableCell>
          <IconButton aria-label="expand row" size="small">
            {row.isFocused ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <DaysOpenChip
            timeOnly
            daysOpen={daysSinceSlackMessage(row.slackTs)}
          />
        </TableCell>
        <TableCell>
          {row["Timeline"]}
        </TableCell>
        <TableCell>
          {row["First Name"]}
          <Box className={classes.chipRow}>
            {row["For Driving Clusters"] && <DrivingClusterChip />}
            <HouseholdSizeChip size={row["Household Size"]} />
          </Box>
        </TableCell>
        <TableCell>
          {row["Need"]}
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
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={row.isFocused} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="subtitle1" gutterBottom component="div">
                Description
              </Typography>
              <div className={classes.description}> {row["Description"]} </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default DeliveryTableRow;
