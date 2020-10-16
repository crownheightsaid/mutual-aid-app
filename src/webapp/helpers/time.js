import { differenceInDays, parseISO } from "date-fns";

/**
 * @param {string} isoTimestamp - ISO timestamp, eg "2020-10-09T18:38:28.000Z"
 * @returns {number} - difference in days since provided ISO timestamp
 */
const getDaysSinceIsoTimestamp = (isoTimestamp) => {
  if (!isoTimestamp || typeof isoTimestamp !== "string") {
    return -1;
  }
  const datePosted = parseISO(isoTimestamp);
  return differenceInDays(new Date(), datePosted);
};

export { getDaysSinceIsoTimestamp };
