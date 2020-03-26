import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Box from "@material-ui/core/Box";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
    marginTop: "inherit"
  },
  content: {
    paddingBottom: theme.spacing(0)
  },
  body: {
    display: "inline-flex"
  },
  divider: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
}));

export default function RequestCard({ doc, assign, cantAssign }) {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <Card className={classes.root}>
      <CardContent className={classes.content}>
        <Typography variant="h5" component="h2">
          {`${doc.firstname} ${doc.lastname.charAt(0)}`}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {doc.neighborhood}
          {bull}
          {doc.postal}
        </Typography>
        <Typography className={classes.body} variant="body2" component="div">
          <Box>
            <b>Preferred store: </b>
            <span>
              &nbsp;
              {doc.store}
            </span>
          </Box>
          <Divider
            className={classes.divider}
            orientation="vertical"
            flexItem
          />
          <Box>
            <b>Payment method:</b>
            <span>
              &nbsp;
              {doc.payment}
            </span>
          </Box>
        </Typography>
      </CardContent>
      <CardActions>
        <Tooltip
          disableHoverListener={!cantAssign}
          disableFocusListener={!cantAssign}
          title="Complete assignments to get more!"
          placement="right"
        >
          <span>
            <Button
              variant="contained"
              disabled={cantAssign}
              onClick={() => assign()}
              size="small"
            >
              Assign to Me
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
