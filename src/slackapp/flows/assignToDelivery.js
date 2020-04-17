const assert = require("assert").strict;
const {
  errorResponse,
  successResponse,
  messageErrorResponse
} = require("../views.js");
const slackapi = require("~slack/webApi");
const { addBotToChannel } = require("../lib/channels.js");
const {
  findVolunteerById,
  updateRequestByCode,
  findRequestByCode
} = require("~airtable/bases");

exports.atdViewSubmission = async payload => {
  try {
    const flowMetadata = JSON.parse(payload.view.private_metadata);
    const volunteerSlackId = payload.user.id;
    const slackUserResponse = await slackapi.users.info({
      token: process.env.SLACK_BOT_TOKEN,
      user: volunteerSlackId
    });
    const slackUserEmail = slackUserResponse.user.profile.email;

    const requestCode = payload.view.state.values.requestblock.request_code.value.toUpperCase();
    const checkedOptions =
      payload.view.state.values.options_block.options.selected_options;
    const shouldReplyOnThread =
      checkedOptions &&
      checkedOptions.find(option => option.value === "should_reply");
    const shouldDirectMessage =
      checkedOptions &&
      checkedOptions.find(option => option.value === "should_start_dm");
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
    const [volunteer, verr] = await findVolunteerById(volId);
    if (verr) {
      throw new Error(verr);
    }
    const assignedVolunteerEmail = volunteer.get("volunteer_email");
    if (slackUserEmail.toLowerCase() !== assignedVolunteerEmail.toLowerCase()) {
      console.log(
        `Request Code Error Assignment: ${requestCode}\n${slackUserEmail}`
      );
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
      console.log(`Request Code Error: ${requestCode}\n${uerr}`);
      return errorResponse(
        "Error updating the Request in Airtable. Please try again.\n\n You can update Airtable and message the delivery volunteer manually if it still doesn't work :/"
      );
    }
    if (shouldDirectMessage) {
      const dmResponse = await slackapi.conversations.open({
        token: process.env.SLACK_BOT_TOKEN,
        users: `${delivererSlackId},${volunteerSlackId}`
      });
      const messageId = dmResponse.channel.id;
      const dmLines = [
        `*Request Code:*\n>${request.get("Code") || "N/A"}`,
        `*First Name:*\n>${request.get("First Name") || "N/A"}`,
        `*Phone:*\n>${request.get("Phone")}`,
        `*Cross Streets:*\n>${request.get("Cross Street #1")} & ${request.get(
          "Cross Street #2"
        )}`,
        `*Request Notes:*\n>${request.get("Intake General Notes")}`
      ];
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
              text: dmLines.join("\n")
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "_*Reminder:* When you make a delivery, drop the groceries at the door," +
                " step 6 feet away, and make sure that the recipient knows " +
                "to wipe down all the groceries (or wash with soap and water)_"
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
  await addBotToChannel(payload.channel.id);
  let codeGuess = "Please enter code manually :/";
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
      const capturingRegex = /Code[^\w\d]+(?<code>[\w\d]{4})[^\w\d]*\n/;
      const found = requestMessage.messages[0].text.match(capturingRegex);
      if (found.groups.code) {
        codeGuess = found.groups.code;
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
              initial_value: codeGuess
            },
            label: {
              type: "plain_text",
              text: "Request Code"
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
