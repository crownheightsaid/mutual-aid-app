const { createMessageAdapter } = require("@slack/interactive-messages");
const { openViewWithSections, viewConfig } = require("../views.js");
const slackapi = require("../../slackapi.js");
const { updateRequestByCode } = require("../../airtable.js");

const slackInteractions = createMessageAdapter(
  process.env.SLACK_SIGNING_SECRET
);

// For assignToDelivery modal.
const assignToDelivery = "assignToDelivery";
slackInteractions.viewSubmission(
  { callback_id: viewConfig[assignToDelivery].modalConfig.callback_id },
  async (payload, respond) => {
    try {
      console.log("Submission payload");
      console.log(payload.user);
      const requestCode =
        payload.view.state.values.request_block.request_code.value;
      const user = await slackapi.users.info({
        token: process.env.SLACK_BOT_TOKEN,
        user: payload.user
      });
      const request = await findRequestByCode(user.user.profile.email);
    } catch (error) {
      console.error(error);
    }
  }
);

slackInteractions.action(
  {
    type: "message_action",
    callback_id: viewConfig[assignToDelivery].modal_entry_id
  },
  async (payload, respond) => {
    try {
      // const user = await slackapi.users.info({
      //   token: process.env.SLACK_BOT_TOKEN,
      //   user: event.user,
      //   include_locale: true
      // });
      // const volunteer = await findVolunteerByEmail(user.user.profile.email);
      openViewWithSections(payload.trigger_id, assignToDelivery);
    } catch (error) {
      console.error(error);
    }
    console.log("Payload");
    console.log(payload.message.blocks);
  }
);

module.exports = slackInteractions.requestListener();
