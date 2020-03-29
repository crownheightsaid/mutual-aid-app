const { createMessageAdapter } = require("@slack/interactive-messages");

const slackInteractions = createMessageAdapter(
  process.env.SLACK_SIGNING_SECRET
);

module.exports = slackInteractions.requestListener();
