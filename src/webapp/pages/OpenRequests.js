import React, { useContext, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import SendRoundedIcon from "@material-ui/icons/SendRounded";
import FormControl from "@material-ui/core/FormControl";
import JustTextContent from "../components/JustTextContext";
import RequestCard from "../components/RequestCard";
import CardList from "../components/CardList";

const useStyles = makeStyles(theme => ({
  input: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(3)
  }
}));

export default function OpenRequests() {
  const classes = useStyles();

  const [zipInput, setZipInput] = useState(null);
  const [loadedZip, setLoadedZip] = useState(null);
  const [writeError, setWriteError] = useState(null);

  // const app = useContext(FirebaseContext);
  // const [userQuery, userLoading, userError] = useLoggedInVolunteerQuery(
  //   uid =>
  //     app
  //       .firestore()
  //       .collection("volunteers")
  //       .doc(uid),
  //   app
  // );
  // const requestsRef = app
  //   .firestore()
  //   .collection("requests")
  //   .where("assigned", "==", "");
  // const requestQuery = loadedZip
  //   ? requestsRef.where("postal", "==", loadedZip)
  //   : requestsRef;
  // const [snapshot, snapshotLoading, snapshotError] = useCollection(
  //   requestQuery.limit(10)
  // );

  // if (snapshotError || userError) {
  //   return <JustTextContent header="Error loading deliveries :/" />;
  // }
  // if ((userLoading || snapshotLoading) && !loadedZip) {
  //   return <CircularProgress className={classes.input} />;
  // }
  // if (!userQuery) {
  //   return <JustTextContent header="Please login to see requests!" />;
  // }
  // if (!userQuery.exists) {
  //   return <JustTextContent header="No record for logged in user." />;
  // }
  // const userData = userQuery.data();

  // const assignToMe = requestId => {
  //   const volunteerRef = app
  //     .firestore()
  //     .collection("volunteers")
  //     .doc(userData.uid);
  //   const requestRef = app
  //     .firestore()
  //     .collection("requests")
  //     .doc(requestId);
  //   app
  //     .firestore()
  //     .runTransaction(transaction => {
  //       // This code may get re-run multiple times if there are conflicts.
  //       return transaction.get(requestRef).then(requestDoc => {
  //         if (!requestDoc.exists) {
  //           return Promise.reject(new Error("Doc not found"));
  //         }

  //         const requestData = requestDoc.data();
  //         if (requestData.assigned) {
  //           return Promise.reject(new Error("Already assigned"));
  //         }

  //         transaction.update(volunteerRef, {
  //           incompleteAssignments: firebase.firestore.FieldValue.increment(1),
  //           totalAssignments: firebase.firestore.FieldValue.increment(1)
  //         });
  //         transaction.update(requestRef, {
  //           assigned: userData.uid
  //         });
  //         return userData.incompleteAssignments + 1;
  //       });
  //     })
  //     .then(() => {
  //       navigateIntl(`/${userData.uid}/assigned-requests`);
  //     })
  //     .catch(e => {
  //       setWriteError(e);
  //     });
  // };

  // const enterZip = (
  //   <InputAdornment position="end">
  //     <IconButton onClick={() => setLoadedZip(zipInput)} edge="end">
  //       <SendRoundedIcon />
  //     </IconButton>
  //   </InputAdornment>
  // );

  // const cantAssign = true;

  return (
    <>
      {/* <FormControl className={classes.input} variant="outlined">
        <InputLabel htmlFor="zip-input">
          {intl.formatMessage(messages["app.request.form.postal"])}
        </InputLabel>
        <OutlinedInput
          id="zip-input"
          autoComplete="postal-code"
          type="text"
          onChange={event => setZipInput(event.target.value)}
          endAdornment={enterZip}
          labelWidth={70}
        />
      </FormControl>
      {writeError && (
        <JustTextContent
          className={classes.input}
          header="Error assigning delivery."
        />
      )}

      {snapshot && snapshot.empty && (
        <JustTextContent
          className={classes.input}
          body="No requests for postal code!"
        />
      )}
      {snapshot && !snapshot.empty && (
        <CardList>
          {snapshot.docs.map(doc => (
            <RequestCard
              cantAssign={cantAssign}
              key={doc.id}
              assign={() => assignToMe(doc.id)}
              doc={doc.data()}
            />
          ))}
        </CardList>
      )} */}
    </>
  );
}
