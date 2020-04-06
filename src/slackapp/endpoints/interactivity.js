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
    callbackId: atdViewOpenEntryId
  },
  atdViewOpen
);

slackInteractions.viewSubmission(
  { callbackId: atdViewSubmissionCallbackId },
  atdViewSubmission
);

// ==================================================================
// Delivery Request Post flow
// ==================================================================
createDeliveryRequest.register(slackInteractions);

module.exports = slackInteractions.requestListener();
