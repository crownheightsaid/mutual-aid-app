const { createMessageAdapter } = require("@slack/interactive-messages");

const slackInteractions = createMessageAdapter(
  process.env.SLACK_SIGNING_SECRET
);

slackInteractions.action(
  { type: "message_action", callback_id: "assign-to-delivery" },
  (payload, respond) => {
    console.log("Payload");
    console.log(payload);
  }
);

module.exports = slackInteractions.requestListener();
