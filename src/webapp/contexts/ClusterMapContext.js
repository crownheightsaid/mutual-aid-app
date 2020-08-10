import { createContext } from "react";

const ClusterMapContext = createContext({
  focusedRequestId: "",
  setFocusedRequestId: () => {},
});

export default ClusterMapContext;
