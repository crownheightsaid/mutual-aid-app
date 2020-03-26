import React, { useState } from "react";

import JustTextContent from "../components/JustTextContext";

export default function LoginPage() {
  const [error, setError] = useState(null);

  // if (user) {
  //   app
  //     .firestore()
  //     .collection("volunteers")
  //     .doc(user.uid)
  //     .set(
  //       {
  //         uid: user.uid,
  //         incompleteAssignments: firebase.firestore.FieldValue.increment(0),
  //         totalAssignments: firebase.firestore.FieldValue.increment(0),
  //         email: user.email
  //       },
  //       { merge: true }
  //     )
  //     .then(() => {
  //       navigateIntl(`/${user.uid}/assigned-requests`);
  //     })
  //     .catch(e => setError(e));
  // }

  return <>{error && <JustTextContent body="Could not authenticate" />}</>;
}
