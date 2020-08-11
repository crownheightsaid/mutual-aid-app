import { differenceInDays, fromUnixTime } from "date-fns";

const daysSinceSlackMessage = (slackTs) => {
  const datePosted = fromUnixTime(Number(slackTs));
  return differenceInDays(new Date(), datePosted);
};

export { daysSinceSlackMessage };
