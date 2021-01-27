const assert = require("assert").strict;
const {
  errorResponse,
  successResponse,
  messageErrorResponse,
} = require("~slack/views");
const slackapi = require("~slack/webApi");
const { addBotToChannel } = require("~slack/channels");
const {
  updateRequestByCode,
  findRequestByCode,
} = require("~airtable/tables/requests");
const { fields: requestFields } = require("~airtable/tables/requestsSchema");
const {
  findVolunteerById,
  volunteersFields,
} = require("~airtable/tables/volunteers");
const { str } = require("~strings/i18nextWrappers");

exports.atdViewSubmission = async (payload) => {
  try {
    const flowMetadata = JSON.parse(payload.view.private_metadata);
    const volunteerSlackId = payload.user.id;
    const slackUserResponse = await slackapi.users.info({
      token: process.env.SLACK_BOT_TOKEN,
      user: volunteerSlackId,
    });
    const slackUserEmail = slackUserResponse.user.profile.email;

    const requestCode = payload.view.state.values.requestblock.request_code.value.toUpperCase();
    const checkedOptions =
      payload.view.state.values.options_block.options.selected_options;
    const shouldReplyOnThread =
      checkedOptions &&
      checkedOptions.find((option) => option.value === "should_reply");
    const shouldDirectMessage =
      checkedOptions &&
      checkedOptions.find((option) => option.value === "should_start_dm");
    const [request, err] = await findRequestByCode(requestCode);
    if (err) {
      return messageErrorResponse(
        "requestblock",
        str("slackapp:assignDelivery.error.noRequest")
      );
    }
    console.log("Pre intake");
    const volId = request.get(requestFields.intakeVolunteer);
    if (!volId) {
      return messageErrorResponse(
        "requestblock",
        str("slackapp:assignDelivery.error.noVolunteer")
      );
    }
    console.log("Pre status check");
    if (
      request.get(requestFields.status) ===
      requestFields.status_options.deliveryAssigned
    ) {
      return messageErrorResponse(
        "requestblock",
        str("slackapp:assignDelivery.error.alreadyAssigned")
      );
    }
    console.log("Pre volunteer");
    const [volunteer, verr] = await findVolunteerById(volId);
    if (verr) {
      throw new Error(verr);
    }
    const assignedVolunteerEmail = volunteer.get(volunteersFields.email);
    if (slackUserEmail.toLowerCase() !== assignedVolunteerEmail.toLowerCase()) {
      console.log(
        `Request Code Error Assignment: ${requestCode}\n${slackUserEmail}`
      );
      return messageErrorResponse(
        "requestblock",
        str("slackapp:assignDelivery.error.noPermission")
      );
    }
    const delivererSlackId = flowMetadata.delivererId;
    const userResponse = await slackapi.users.info({
      token: process.env.SLACK_BOT_TOKEN,
      user: delivererSlackId,
    });
    const deliveryName = userResponse.user.real_name;
    const [_updated, uerr] = await updateRequestByCode(requestCode, {
      [requestFields.status]: requestFields.status_options.deliveryAssigned,
      [requestFields.deliveryVolunteer]: deliveryName,
      [requestFields.deliverySlackId]: delivererSlackId,
    });
    if (uerr) {
      console.log(`Request Code Error: ${requestCode}\n${uerr}`);
      return errorResponse(str("slackapp:assignDelivery.error.airtableError"));
    }
    if (shouldDirectMessage) {
      const dmResponse = await slackapi.conversations.open({
        token: process.env.SLACK_BOT_TOKEN,
        users: `${delivererSlackId},${volunteerSlackId}`,
      });
      const messageId = dmResponse.channel.id;
      const dmLines = [
        `*${str("slackapp:assignDelivery.dm.code")}:*\n>${
          request.get(requestFields.code) || str("common:notAvailable")
        }`,
        `*${str("slackapp:assignDelivery.dm.firstName")}:*\n>${
          request.get(requestFields.firstName) || str("common:notAvailable")
        }`,
        `*${str("slackapp:assignDelivery.dm.phone")}:*\n>${request.get(
          requestFields.phone
        )}`,
        `*${str("slackapp:assignDelivery.dm.crossStreets")}:*\n>${request.get(
          requestFields.crossStreetFirst
        )} & ${request.get(requestFields.crossStreetSecond)}`,
        `*${str("slackapp:assignDelivery.dm.householdSize")}:*\n>${
          request.get(requestFields.householdSize) || str("common:notAvailable")
        }`,
        `*${str("slackapp:assignDelivery.dm.notes")}:*\n>${
          request.get(requestFields.intakeNotes) || str("common:notAvailable")
        }`,
      ];
      await slackapi.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: messageId,
        text: str(
          "slackapp:assignDelivery.dm.message.default",
          "Delivery has been assigned!"
        ),
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: str("slackapp:assignDelivery.dm.message.text"),
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: dmLines.join("\n"),
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: str("slackapp:assignDelivery.dm.message.reminder", {
                flyersUrl: str("common:links.groceryFlyers"),
              }),
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: str("slackapp:assignDelivery.dm.message.outro", {
                defaultValue:
                  "*Submit your receipt:* Afterwards, please fill out this handy <{{- reimbursementUrl}}|reimbursement form>, it will automatically post to the #community_reimbursement channel!\n\nFor more information, please see the <{{- guideUrl}}|delivery guide>.",
                reimbursementUrl: str("common:links.reimbursementForm"),
                guideUrl: str("common:links.deliveryGuide"),
              }),
            },
          },
        ],
      });
    }
    if (shouldReplyOnThread) {
      await slackapi.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: flowMetadata.channelId,
        thread_ts: flowMetadata.threadId,
        text: str("slackapp:assignDelivery.postNotify.message", {
          defaultValue:
            "{{delivererName}} you're on! You'll get a DM soon with details :slightly_smiling_face:",
          delivererName: deliveryName,
        }),
      });
    }
    return successResponse(str("slackapp:assignDelivery.success"));
  } catch (error) {
    return errorResponse(
      `${str("slackapp:assignDelivery.error.default")}: ${error}`
    );
  }
};

const atdSubmitCallback = "assign-to-delivery-submit";

exports.atdViewSubmissionCallbackId = atdSubmitCallback;
exports.atdViewOpen = async (payload) => {
  await addBotToChannel(payload.channel.id);
  let codeGuess = str("slackapp:assignDelivery.modal.manualCode");
  // This means it's a reply and we can try to look for a request Code.
  if (payload.message.thread_ts !== payload.message.ts) {
    try {
      const requestMessage = await slackapi.conversations.history({
        token: process.env.SLACK_BOT_TOKEN,
        channel: payload.channel.id,
        latest: payload.message.thread_ts,
        limit: 1,
        inclusive: true,
      });
      assert(requestMessage.messages.length !== 0, "No messages found.");
      const capturingRegex = /Code[^\w\d]+(?<code>[\w\d]{4,6})[^\w\d]*\n/;
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
    threadId: payload.message.thread_ts, // undefined if thread should not be replied to
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
          text: str(
            "slackapp:assignDelivery.modal.title",
            "Assign to Delivery"
          ),
        },
        submit: {
          type: "plain_text",
          text: str("common:submit"),
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: str("slackapp:assignDelivery.modal.messageIntro"),
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: str("slackapp:assignDelivery.modal.message"),
            },
          },
          {
            type: "input",
            block_id: "requestblock",
            element: {
              type: "plain_text_input",
              action_id: "request_code",
              min_length: 4,
              max_length: 6,
              initial_value: codeGuess,
            },
            label: {
              type: "plain_text",
              text: str("slackapp:assignDelivery.modal.code"),
            },
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
                    text: str("slackapp:assignDelivery.modal.dmOption"),
                  },
                  value: "should_start_dm",
                },
              ],
              options: [
                // IF CHANGING, make sure to reflect right above
                {
                  text: {
                    type: "plain_text",
                    text: str(
                      "slackapp:assignDelivery.modal.threadOption",
                      "Reply to the thread with confirmation"
                    ),
                  },
                  value: "should_reply",
                },
                {
                  text: {
                    type: "plain_text",
                    text: str(
                      "slackapp:assignDelivery.modal.dmOption",
                      "Start a DM with request info between you and the assignee"
                    ),
                  },
                  value: "should_start_dm",
                },
              ],
            },
            label: {
              type: "plain_text",
              text: str("slackapp:assignDelivery.modal.botOptionText"),
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
