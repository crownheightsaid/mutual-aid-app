const assert = require("assert").strict;
const {
  errorResponse,
  successResponse,
  messageErrorResponse
} = require("../views.js");
const slackapi = require("../../slackapi.js");
const {
  findVolunteerById,
  updateRequestByCode,
  findRequestByCode
} = require("../../airtable.js");

exports.atdViewSubmission = async payload => {
  try {
    const flowMetadata = JSON.parse(payload.view.private_metadata);
    const slackUserResponse = await slackapi.users.info({
      token: process.env.SLACK_BOT_TOKEN,
      user: payload.user.id
    });
    const slackUserEmail = slackUserResponse.user.profile.email;

    const requestCode = payload.view.state.values.requestblock.request_code.value.toUpperCase();
    const checkedOptions =
      payload.view.state.values.options_block.options.selected_options;
    const shouldReplyOnThread = checkedOptions.find(
      option => option.value === "should_reply"
    );
    const shouldDirectMessage = checkedOptions.find(
      option => option.value === "should_start_dm"
    );
    const [request, err] = await findRequestByCode(requestCode);
    if (err) {
      return messageErrorResponse(
        "requestblock",
        "We couldn't find a request with that code. Please make sure it exists in the Requests table."
      );
    }
    console.log("Pre intake");
    const volId = request.get("Intake volunteer");
    if (!volId) {
      return messageErrorResponse(
        "requestblock",
        "No intake volunteer was assigned to the request ID you entered :/"
      );
    }
    console.log("Pre status check");
    if (
      request.get("Status") === "Delivery Assigned" ||
      request.get("Delivery slackId")
    ) {
      return messageErrorResponse(
        "requestblock",
        "This request looks like it already has a delivery volunteer!"
      );
    }
    console.log("Pre volunteer");
    const volunteer = await findVolunteerById(volId);
    const assignedVolunteerEmail = volunteer.get("volunteer_email");
    if (slackUserEmail !== assignedVolunteerEmail) {
      return messageErrorResponse(
        "requestblock",
        "It doesn't look like you are assigned to this request :/\nLet #tech know if we messed up."
      );
    }
    const delivererSlackId = flowMetadata.delivererId;
    const userResponse = await slackapi.users.info({
      token: process.env.SLACK_BOT_TOKEN,
      user: delivererSlackId
    });
    const deliveryName = userResponse.user.real_name;
    const [_updated, uerr] = await updateRequestByCode(requestCode, {
      Status: "Delivery Assigned",
      "Delivery volunteer": deliveryName,
      "Delivery slackId": delivererSlackId
    });
    if (uerr) {
      return errorResponse(
        "Error updating the Request in Airtable. Please try again.\n\n You can update Airtable and message the delivery volunteer manually if it still doesn't work :/"
      );
    }
    if (shouldDirectMessage) {
      const dmResponse = await slackapi.conversations.open({
        token: process.env.SLACK_BOT_TOKEN,
        users: `${delivererSlackId},${volunteer.get("volunteer_slack_id")}`
      });
      const messageId = dmResponse.channel.id;
      await slackapi.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: messageId,
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
    }
    if (shouldReplyOnThread) {
      await slackapi.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: flowMetadata.channelId,
        thread_ts: flowMetadata.threadId,
        text: `${deliveryName} you're on! You'll get a DM soon with details :)`
      });
    }
    return successResponse("Delivery assigned!");
  } catch (error) {
    return errorResponse(`An error occured. Let us know in #tech: ${error}`);
  }
};

const atdSubmitCallback = "assign-to-delivery-submit";

exports.atdViewSubmissionCallbackId = atdSubmitCallback;
exports.atdViewOpen = async payload => {
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
  const metadata = {
    delivererId: payload.message.user,
    channelId: payload.channel.id,
    threadId: payload.message.thread_ts // undefined if thread should not be replied to
  };
  try {
    await slackapi.views.open({
      token: process.env.SLACK_BOT_TOKEN,
      trigger_id: payload.trigger_id,
      view: {
        type: "modal",
        callback_id: atdSubmitCallback,
        private_metadata: JSON.stringify(metadata),
        title: {
          type: "plain_text",
          text: "Assign to Delivery"
        },
        submit: {
          type: "plain_text",
          text: "Submit"
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "You found a delivery volunteer! 🎉🎉"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "If you give us the request code, we'll update all the airtable info and start a DM between you both."
            }
          },
          {
            type: "input",
            block_id: "requestblock",
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
            optional: true,
            block_id: "options_block",
            element: {
              type: "checkboxes",
              action_id: "options",
              initial_options: [
                {
                  text: {
                    type: "plain_text",
                    text: "Reply to the thread with confirmation"
                  },
                  value: "should_reply"
                },
                {
                  text: {
                    type: "plain_text",
                    text:
                      "Start a DM with request info between you and the assignee"
                  },
                  value: "should_start_dm"
                }
              ],
              options: [
                // IF CHANGING, make sure to reflect right above
                {
                  text: {
                    type: "plain_text",
                    text: "Reply to the thread with confirmation"
                  },
                  value: "should_reply"
                },
                {
                  text: {
                    type: "plain_text",
                    text:
                      "Start a DM with request info between you and the assignee"
                  },
                  value: "should_start_dm"
                }
              ]
            },
            label: {
              type: "plain_text",
              text: "Bot Options"
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
