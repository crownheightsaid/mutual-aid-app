/**
 * A map from urgency level to style object
 * usable by Material UI.
 */
export const urgencyStyles = {
  invalid: {
    backgroundColor: "grey",
  },
  recent: {
    backgroundColor: "green",
  },
  moderate: {
    backgroundColor: "orange",
  },
  urgent: {
    backgroundColor: "red",
  },
};

/**
 * Given the number of days the request has been open,
 * returns the urgency level of the request.
 *
 * @param {number} daysOpen
 */
export const getUrgencyLevel = (daysOpen) => {
  if (daysOpen < 0) {
    return "invalid";
  }
  if (daysOpen < 3) {
    return "recent";
  }
  if (daysOpen < 5) {
    return "moderate";
  }
  return "urgent";
};

/**
 * Given the number of days the request has been open,
 * returns the styles associated with the urgency level.
 * A convenience function that connects the level to the styles.
 *
 * @param {number} daysOpen
 */
export const getUrgencyStyles = (daysOpen) =>
  urgencyStyles[getUrgencyLevel(daysOpen)];
