import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import JustTextContent from "../components/JustTextContext";
import AssignmentCard from "../components/AssignmentCard";
import CardList from "../components/CardList";

const useStyles = makeStyles(theme => ({
  input: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(3)
  }
}));

export default function MyAssignments() {
  const classes = useStyles();
  let [assignments, loading, error] = [null, null, null];

  if (error) {
    return <JustTextContent header="Error loading deliveries :/" />;
  }
  if (loading) {
    return <CircularProgress className={classes.input} />;
  }
  if (!assignments) {
    return (
      <JustTextContent
        header="Please login to see requests!"
        followupText="Log In"
        followupRoute="/open-requests"
      />
    );
  }
  if (assignments.empty) {
    return (
      <JustTextContent
        // followupText={intl.formatMessage(messages["app.drawer.makedelivery"])}
        followupRoute="/open-requests"
        body="No assigned deliveries. Click below to get started!"
      />
    );
  }

  assignments = {
    docs: [
      {
        name: "Another Madeline",
        phone: "555-555-5555",
        store: "Another Madeline",
        callText:
          "Hey I could really use some groceries please call me back at 555-555-55555"
      }
    ]
  };

  return (
    <>
      {loading && <CircularProgress className={classes.input} />}
      {error && <JustTextContent className={classes.input} header="Error" />}

      {assignments && (
        <>
          <JustTextContent
            header="Your Deliveries"
            body="Thanks for helping! After delivery, please upload a picture to show it's completed &#127969;"
          />
          <CardList>
            {assignments.docs.map(doc => (
              <AssignmentCard
                // app={app}
                key={doc.id}
                requestId={doc.id}
                doc={doc.data()}
              />
            ))}
          </CardList>
        </>
      )}
    </>
  );
}
