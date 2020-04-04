const { createMessageAdapter } = require("@slack/interactive-messages");
const {
  atdViewSubmission,
  atdViewSubmissionCallbackId,
  atdViewOpen
} = require("../flows/assignToDelivery.js");

const slackInteractions = createMessageAdapter(
  process.env.SLACK_SIGNING_SECRET
);

// ==================================================================
// Callbacks / entry points registered in Slack
// ==================================================================

const atdViewOpenEntryId = "assign-to-delivery";

// ==================================================================
// Assign To Delivery flow
// ==================================================================

slackInteractions.action(
  {
    type: "message_action",
    callback_id: atdViewOpenEntryId
  },
  atdViewOpen
);
slackInteractions.viewSubmission(
  { callback_id: atdViewSubmissionCallbackId },
  atdViewSubmission
);

// ==================================================================
// [WIP] Delivery Request Post flow
// ==================================================================

module.exports = slackInteractions.requestListener();
