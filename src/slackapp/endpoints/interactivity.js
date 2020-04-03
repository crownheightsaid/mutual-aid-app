const { createMessageAdapter } = require("@slack/interactive-messages");
const { openViewWithSections, viewConfig, errorModal } = require("../views.js");
const slackapi = require("../../slackapi.js");
const { findVolunteerById, findRequestByCode } = require("../../airtable.js");

const slackInteractions = createMessageAdapter(
  process.env.SLACK_SIGNING_SECRET
);

// For assignToDelivery modal.
const assignToDelivery = "assignToDelivery";
slackInteractions.viewSubmission(
  { callback_id: viewConfig[assignToDelivery].modalConfig.callback_id },
  async payload => {
    try {
      const slackUserResponse = await slackapi.users.info({
        token: process.env.SLACK_BOT_TOKEN,
        user: payload.user.id
      });
      const slackUserEmail = slackUserResponse.user.profile.email;
      console.log("here we are");
      console.log(slackUserEmail);

      const requestCode = payload.view.state.values.request_block.request_code.value.toUpperCase();
      const [request, err] = await findRequestByCode(requestCode);
      if (err) {
        return {
          response_action: "update",
          view: errorModal(
            "We couldn't find a request with that code. Please make sure it exists in the Requests table."
          )
        };
      }
      const volId = request.get("Intake volunteer");
      if (!volId) {
        return {
          response_action: "update",
          view: errorModal(
            "No one was assigned to the request ID you entered :/"
          )
        };
      }
      console.log(volId);
      const volunteer = await findVolunteerById(volId);
      const assignedVolunteerEmail = volunteer.get("volunteer_email");
      console.log(assignedVolunteerEmail);
      if (slackUserEmail !== assignedVolunteerEmail) {
        return {
          response_action: "errors",
          errors: {
            "request-block":
              "It doesn't look like you are assigned to this request :/\nLet #tech know if we messed up."
          }
        };
      }
      return {
        response_action: "update",
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "Delivery Assigned!"
          },
          blocks: []
        }
      };
    } catch (error) {
      return {
        response_action: "update",
        view: errorModal(`An error occured. Let us know in #tech: ${error}`)
      };
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
    console.log(JSON.stringify(payload.message.blocks));
  }
);

module.exports = slackInteractions.requestListener();
