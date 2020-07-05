const { createMessageAdapter } = require("@slack/interactive-messages");
const {
  atdViewSubmission,
  atdViewSubmissionCallbackId,
  atdViewOpen,
} = require("../flows/assignToDelivery.js");

const createDeliveryRequest = require("../flows/createDeliveryRequest");
const editPost = require("../flows/editPost");

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
    callbackId: atdViewOpenEntryId,
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

// ==== Edit Post flow ====
editPost.register(slackInteractions);

module.exports = slackInteractions.requestListener();
