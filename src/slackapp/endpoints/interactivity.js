const { createMessageAdapter } = require("@slack/interactive-messages");
const assert = require("assert").strict;
const {
  openViewWithBlocks,
  viewConfig,
  errorResponse,
  successResponse
} = require("../views.js");
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
    try {
      console.log("Payload");
      console.log(payload);
      const slackUserResponse = await slackapi.users.info({
        token: process.env.SLACK_BOT_TOKEN,
        user: payload.user.id
      });
      const slackUserEmail = slackUserResponse.user.profile.email;

      const requestCode = payload.view.state.values.request_block.request_code.value.toUpperCase();
      const [request, err] = await findRequestByCode(requestCode);
      if (err) {
        return {
          response_action: "errors",
          errors: {
            "request-block":
              "We couldn't find a request with that code. Please make sure it exists in the Requests table."
          }
        };
      }
      console.log("\n\n\nRequest");
      console.log(request);
      const volId = request.get("Intake volunteer");
      if (!volId) {
        return {
          response_action: "errors",
          errors: {
            "request-block":
              "No one was assigned to the request ID you entered :/"
          }
        };
      }
      const volunteer = await findVolunteerById(volId);
      console.log("\n\n\nVolunteer");
      console.log(volunteer);
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
        payload.view.state.values.deliver_block.deliverer_id.value;
      const [_updated, uerr] = await updateRequestByCode(requestCode, {
        Status: "Delivery Assigned",
        "Delivery volunteer": delivererSlackId
      });
      if (uerr) {
        return errorResponse(
          "Error updating the Request in Airtable. Please try again.\n\n You can update Airtable and message the delivery volunteer manually if it still doesn't work :/"
        );
      }
      const dmResponse = await slackapi.conversations.open({
        token: process.env.SLACK_BOT_TOKEN,
        users: `${delivererSlackId},${volunteer.get("volunteer_slack_id")}`
      });
      const messageId = dmResponse.channel.id;
      await slackapi.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: messageId,
        username: "Crown Heights Delivery Bot",
        text: "Delivery has been assigned!",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "Thanks to you both for volunteering. Here's some details on the request. Let's help some neighbors!"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Phone:*\n>${request.get(
                "Phone"
              )}\n*Cross Streets:*\n>${request.get(
                "Cross Street #1"
              )} & ${request.get(
                "Cross Street #2"
              )}\n*Request Notes:*\n>${request.get("Intake General Notes")}`
            }
          }
        ]
      });
      return successResponse("Delivery assigned!");
    } catch (error) {
      return errorResponse(`An error occured. Let us know in #tech: ${error}`);
    }
  }
);

slackInteractions.action(
  {
    type: "message_action",
    callback_id: viewConfig[assignToDelivery].modal_entry_id
  },
  async payload => {
    let codeGuess = "nothing :(";
    // This means it's a reply and we can try to look for a request Code.
    if (payload.message.thread_ts !== payload.message.ts) {
      try {
        const requestMessage = await slackapi.conversations.history({
          token: process.env.SLACK_BOT_TOKEN,
          channel: payload.channel.id,
          latest: payload.message.thread_ts,
          limit: 1,
          inclusive: true
        });
        assert(requestMessage.messages.length !== 0, "No messages found.");
        const capturingRegex = /Code(?<code>.*)\n/;
        const found = requestMessage.messages[0].text.match(capturingRegex);
        if (found.groups.code && found.groups.code.length >= 4) {
          const codeString = found.groups.code;
          codeGuess = codeString.substr(codeString.length - 4);
        }
      } catch (e) {
        console.log(`Couldn't fetch thread for code guess: ${e}`);
      }
    }
    try {
      openViewWithBlocks(payload.trigger_id, assignToDelivery, [
        {
          type: "input",
          block_id: "request_block",
          element: {
            type: "plain_text_input",
            action_id: "request_code",
            min_length: 4,
            max_length: 4,
            placeholder: {
              type: "plain_text",
              text: "Ex: AKBS"
            }
          },
          label: {
            type: "plain_text",
            text: "Request Code"
          },
          hint: {
            type: "plain_text",
            text: `The bot's best guess is: ${codeGuess}`
          }
        },
        {
          type: "input",
          block_id: "deliver_block",
          element: {
            type: "plain_text_input",
            action_id: "deliverer_id",
            initial_value: payload.message.user
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
