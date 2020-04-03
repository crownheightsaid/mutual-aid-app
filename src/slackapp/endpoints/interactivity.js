const { createMessageAdapter } = require("@slack/interactive-messages");
const { openViewWithBlocks, viewConfig, errorModal } = require("../views.js");
const slackapi = require("../../slackapi.js");
const {
  findVolunteerById,
  updateRequestByCode,
  findRequestByCode
} = require("../../airtable.js");

const slackInteractions = createMessageAdapter(
  process.env.SLACK_SIGNING_SECRET
);

// For assignToDelivery modal.
const assignToDelivery = "assignToDelivery";
slackInteractions.viewSubmission(
  { callback_id: viewConfig[assignToDelivery].modalConfig.callback_id },
  async payload => {
    console.log("submission payload");
    console.log(payload);
    try {
      const slackUserResponse = await slackapi.users.info({
        token: process.env.SLACK_BOT_TOKEN,
        user: payload.user.id
      });
      const slackUserEmail = slackUserResponse.user.profile.email;

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
      const volunteer = await findVolunteerById(volId);
      const assignedVolunteerEmail = volunteer.get("volunteer_email");
      if (slackUserEmail !== assignedVolunteerEmail) {
        return {
          response_action: "errors",
          errors: {
            "request-block":
              "It doesn't look like you are assigned to this request :/\nLet #tech know if we messed up."
          }
        };
      }
      const delivererSlackId =
        payload.view.state.values.request_block.deliverer_id.value;
      const [_updated, uerr] = await updateRequestByCode(requestCode, {
        Status: "Delivery Assigned",
        "Delivery volunteer": delivererSlackId
      });
      if (uerr) {
        return {
          response_action: "update",
          view: errorModal(
            "Error updating the Request in Airtable. Please try again.\n\n You can update Airtable and message the delivery volunteer manually if it still doesn't work :/"
          )
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
  async payload => {
    console.log(payload);
    try {
      openViewWithBlocks(payload.trigger_id, assignToDelivery, [
        {
          type: "input",
          block_id: "request_block",
          element: {
            type: "plain_text_input",
            action_id: "deliverer_id",
            initial_value: payload.user.id
          },
          label: {
            type: "plain_text",
            text: "Deliverer ID (Don't change pls)"
          }
        }
      ]);
    } catch (error) {
      console.error(error);
    }
  }
);

module.exports = slackInteractions.requestListener();
