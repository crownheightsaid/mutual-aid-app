const { createMessageAdapter } = require("@slack/interactive-messages");

const slackInteractions = createMessageAdapter(
  process.env.SLACK_SIGNING_SECRET
);

export default slackInteractions.requestListener();
