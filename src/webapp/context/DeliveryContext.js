import React from "react";

/*
 * Provider logic is handled in DeliveryNeeded.
 * We need this in a separate file so we don't get
 * cyclical dependency lint errors.
 */
const DeliveryContext = React.createContext();

export default DeliveryContext;
