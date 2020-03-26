import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Box from "@material-ui/core/Box";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import PhoneIcon from "@material-ui/icons/Phone";
import EmailIcon from "@material-ui/icons/Email";

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
    marginTop: "inherit"
  },
  content: {
    paddingBottom: theme.spacing(0)
  },
  body: {
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.up("lg")]: {
      justifyContent: "start"
    }
  },
  inlineInfo: {
    display: "inline-flex",
    flexWrap: "wrap"
  },
  grocery: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
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
  upload: {
    marginLeft: "auto",
    paddingRight: "inherit"
  },
  uploadInput: {
    display: "none"
  },
  pos: {
    marginBottom: 12
  }
}));

export default function AssignmentCard({ doc, app, requestId }) {
  const classes = useStyles();
  const [{ completed, uploadError }, setUploadState] = useState({
    completed: doc.uploadedPic,
    uploadError: null
  });
  const bull = <span className={classes.bullet}>•</span>;
  const extraStyle = completed ? { backgroundColor: "#66bb6a" } : {};

  const upload = inputTarget => {
    if (!inputTarget.files || inputTarget.files.length <= 0) {
      setUploadState({ completed: null, uploadError: "No files given" });
      return;
    }
    const file = inputTarget.files[0];
    // 4 Mb
    if (file.size > 4000000) {
      setUploadState({ completed: null, uploadError: "Upload file to large" });
      return;
    }

  //   app
  //     .storage()
  //     .ref()
  //     .child(`${doc.assigned}/${new Date().toISOString()}/uploadfile`)
  //     .put(file)
  //     .then(snapshot => {
  //       const batch = app.firestore().batch();

  //       const volunteerRef = app
  //         .firestore()
  //         .collection("volunteers")
  //         .doc(doc.assigned);
  //       batch.update(volunteerRef, {
  //         incompleteAssignments: firebase.firestore.FieldValue.increment(-1),
  //         completedAssignments: firebase.firestore.FieldValue.increment(1)
  //       });

  //       const requestRef = app
  //         .firestore()
  //         .collection("requests")
  //         .doc(requestId);
  //       batch.update(requestRef, {
  //         uploadedPic: snapshot.metadata.fullPath
  //       });
  //       batch.commit().then(() => {
  //         setUploadState({ completed: true, uploadError: null });
  //       });
  //     });
  // };

  return (
    <Card className={classes.root} style={extraStyle}>
      <CardContent className={classes.content}>
        <Typography variant="h5" component="h2">
          {doc.name}
        </Typography>
        <Typography className={classes.body} variant="body2" component="div">
          <Box className={classes.inlineInfo}>
            <b>Preferred store: </b>
            <span>
              &nbsp;
              {doc.store}
            </span>
          </Box>
        </Typography>
        <Typography className={classes.grocery} variant="body2" component="p">
          {doc["callText"]}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton href={`tel:${doc.phone}`}>
          <PhoneIcon />
        </IconButton>
        {uploadError}
        <Box className={classes.upload}>
          <input
            accept="image/*"
            className={classes.uploadInput}
            id="upload-button"
            type="file"
            onChange={event => upload(event.target)}
          />
          <label htmlFor="upload-button">
            <Button
              variant="contained"
              disabled={Boolean(completed)}
              size="small"
              component="span"
            >
              Upload Pic
            </Button>
          </label>
        </Box>
      </CardActions>
    </Card>
  );
}
