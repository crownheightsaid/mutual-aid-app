// import React, { createContext, useEffect, useState, useCallback } from "react";
// import app from "firebase/app";
// import { useAuthState } from "react-firebase-hooks/auth";

// const FirebaseContext = createContext(null);

// export default function FirebaseProvider({ children }) {
//   if (!app.apps.length) {
//     app.initializeApp({
//       apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//       authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//       databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
//       projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//       storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//       appId: process.env.REACT_APP_FIREBASE_APP_ID
//     });
//   }
//   return (
//     <FirebaseContext.Provider value={app}>{children}</FirebaseContext.Provider>
//   );
// }

// export const useLoggedInVolunteerQuery = (uidQuery, fireapp) => {
//   const [user, loading, error] = useAuthState(fireapp.auth());
//   const [
//     { snapshotData, snapshotLoading, snapshotError },
//     setSnapshotState
//   ] = useState({
//     snapshotData: null,
//     snapshotLoading: false,
//     snapshotError: null
//   });
//   const memoUidQuery = useCallback(uidQuery, []);
//   useEffect(() => {
//     if (user) {
//       setSnapshotState({
//         snapshotData: null,
//         snapshotLoading: true,
//         snapshotError: null
//       });
//       memoUidQuery(user.uid)
//         .get()
//         .then(snapshot => {
//           setSnapshotState({
//             snapshotData: snapshot,
//             snapshotLoading: false,
//             snapshotError: null
//           });
//         })
//         .catch(e => {
//           setSnapshotState({
//             snapshotData: null,
//             snapshotLoading: false,
//             snapshotError: "Error fetching user"
//           });
//         });
//     }
//   }, [user, memoUidQuery, fireapp]);

//   return [snapshotData, loading || snapshotLoading, error || snapshotError];
// };

// export { FirebaseContext };
