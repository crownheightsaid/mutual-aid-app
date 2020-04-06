const { sortBy, isEqual } = require("lodash");
const slackapi = require("../../slackapi");
const { findChannelByName } = require("../lib/channels");
const { errorResponse, errorView } = require("../views");
const {
  findOpenRequests,
  findRequestByCode,
  updateRequestByCode
} = require("../../airtable");

const primaryChannelName = "community_needs";
const modalTitle = "Create Delivery Request";

// Slack callback_ids -these functions are hoisted from below for readability
selectRequestForSending.id = "select_delivery_needed_request";
draftRequest.id = "draft_delivery_needed_message";
draftConfirm.id = "confirm_delivery_needed_message";
sendMessage.id = "send_delivry_neeed_message";

/**
 * Adds the interaction handlers for this flow to the slack app.
 * This flow handles the "Post Open Request" shortcut available for
 * intake volunteers to draft and send a new post asking for delivery volunteers
 * from a Request.
 *
 * Slack Setup:
 * - An interactive message Shortcut with callbackId: select_delivery_needed_request configured in the slack app.
 * - Scopes: channels:history channels:write chat:write chat:write_public commands
 *
 * Look at `suggestedTemplate` if you want to change the text that is suggested in the message draft.
 */
module.exports.register = function register(slackInteractions) {
  // User hits "Post Open Request" shortcut and are presented with a choice of which Request to use.
  slackInteractions.callbacks.push([
    { callbackId: selectRequestForSending.id },
    guard(selectRequestForSending)
  ]);
  // User is shown a suggestion of the message to send and can edit it, as well as choose the destination channel.
  slackInteractions.viewSubmission(draftRequest.id, guard(draftRequest));
  // User is shown a preview of the draft
  slackInteractions.viewSubmission(draftConfirm.id, guard(draftConfirm));
  // The message is sent to the chosen channel and a link is sent to the intake volunteer in a DM
  slackInteractions.viewSubmission(sendMessage.id, guard(sendMessage));
};

/**
 * Presents a new modal with a selector for all open requests (that aren't on slack already)
 */
async function selectRequestForSending(payload) {
  let [requests, err] = await findOpenRequests(); // eslint-disable-line
  requests = sortBy(requests, r => r.get("Last Modified")).reverse();

  let view = null;
  if (err) {
    view = errorView(`Error looking up pending requests: ${err}`);
  } else if (requests.length === 0) {
    view = errorView(
      `Couldn't find any pending requests. Is your request in the Delivery Needed state?`
    );
  } else {
    view = await makeRequestSelectionView(requests);
  }
  await slackapi.views.open({
    trigger_id: payload.trigger_id,
    view
  });
}

/**
 * Makes a suggestested message and allows the user to edit it and choose which channel to send to.
 */
async function draftRequest(payload) {
  const code =
    payload.view.state.values.select_request.selected_request.selected_option
      .value;
  const [request, err] = await findRequestByCode(code);
  if (err) {
    return errorResponse(`Request ${code} wasn't found. ${err}`);
  }
  const form = await makeRequestDraftView(payload, request);
  return {
    response_action: "update",
    view: form
  };
}

/**
 * Renders the message as markdown and lets the user confirm or go back to editing
 */
async function draftConfirm(payload) {
  const code = payload.view.private_metadata;
  const { values } = payload.view.state;
  const content = values.draft_message.draft_message.value;
  const channel = values.selected_channel.selected_channel.selected_channel;
  const [request, err] = await findRequestByCode(code);
  if (err) {
    return errorResponse(`Request ${code} wasn't found. ${err}`);
  }
  return {
    response_action: "push",
    view: makeConfirmationView(request, channel, content)
  };
}

/**
 * Posts the message to slack. The bot also sends a DM to the user with a link to the message
 * and updates the Request with the metadata for the message.
 */
async function sendMessage(payload) {
  const context = JSON.parse(payload.view.private_metadata);

  // Send the message
  const deliveryMessage = await slackapi.chat.postMessage({
    channel: context.channelId,
    text: context.content
  });

  // Update the metadata on the Request
  await updateRequestByCode(context.code, {
    Status: "Delivery Needed",
    Meta: {
      slack_ts: deliveryMessage.ts,
      slack_channel: deliveryMessage.channel
    }
  });

  // DM the user with a permalink
  const permalink = await slackapi.chat.getPermalink({
    channel: deliveryMessage.channel,
    message_ts: deliveryMessage.ts
  });
  slackapi.chat.postMessage({
    channel: payload.user.id,
    text: `*${context.code}*: Submitted a new request for delivery to <#${deliveryMessage.channel}>\n${permalink.permalink}`,
    user: payload.user.id
  });

  // Close the modal
  return {
    response_action: "clear"
  };
}

/**
 * Modal view for selecting a requeest to use for the rest of the flow
 */
async function makeRequestSelectionView(requests) {
  const options = requests.map(r => {
    return {
      text: {
        type: "mrkdwn",
        text: `*${r.get("Code")}* ${r.get("Phone") ||
          r.get("Email Address")} _${r.get("Status")}_`
      },
      value: r.get("Code")
    };
  });
  const requestSelectionBlocks = {
    type: "modal",
    callback_id: draftRequest.id,
    clear_on_close: true,
    title: {
      type: "plain_text",
      text: modalTitle,
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "Create Message",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true
    },
    blocks: [
      {
        block_id: "select_request",
        type: "input",
        element: {
          action_id: "selected_request",
          type: "radio_buttons",
          initial_option: options[0],
          options
        },
        label: {
          type: "plain_text",
          text: "Pick a request",
          emoji: true
        }
      }
    ]
  };
  return requestSelectionBlocks;
}

/**
 * Modal view for drafting a new request. Suggests a template automatically.
 */
async function makeRequestDraftView(payload, request) {
  const primaryChannel = await findChannelByName(primaryChannelName);
  const requestDraftBlocks = {
    type: "modal",
    callback_id: draftConfirm.id,
    private_metadata: request.get("Code"),
    title: {
      type: "plain_text",
      text: modalTitle,
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "Preview",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true
    },
    blocks: [
      {
        type: "input",
        block_id: "selected_channel",
        element: {
          type: "channels_select",
          action_id: "selected_channel",
          initial_channel: primaryChannel.id,
          placeholder: {
            type: "plain_text",
            text: "Select a channel",
            emoji: true
          }
        },
        label: {
          type: "plain_text",
          text: "Channel",
          emoji: true
        }
      },
      {
        type: "input",
        block_id: "draft_message",
        element: {
          type: "plain_text_input",
          action_id: "draft_message",
          initial_value: suggestedTemplate(payload, request),
          multiline: true
        },
        label: {
          type: "plain_text",
          text: "Draft Message",
          emoji: true
        }
      }
    ]
  };
  return requestDraftBlocks;
}

/**
 * Modal view for confirming a delivery request
 */
function makeConfirmationView(request, channelId, content) {
  const code = request.get("Code");
  const context = {
    code,
    channelId,
    content
  };
  return {
    type: "modal",
    callback_id: sendMessage.id,
    private_metadata: JSON.stringify(context),
    title: {
      type: "plain_text",
      text: modalTitle,
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "Send",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "Edit",
      emoji: true
    },
    blocks: [
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Request*: ${request.get(
              "Code"
            )}\n*Channel*: <#${channelId}>`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: content
          }
        ]
      }
    ]
  };
}

/**
 * Generates the suggested slack message given a request
 */
function suggestedTemplate(payload, request) {
  const slackId = payload.user.id;
  const streets = [
    request.get("Cross Street #1"),
    request.get("Cross Street #2")
  ].join(" & ");

  const name = `our neighbor at ${streets}`;
  let quadrant = request.get("Neighborhood Area (See Map)");
  if (quadrant.match(/^NE|SE|SW|NE$/)) {
    quadrant += " Crown Heights";
  }

  const services = request.get("What type(s) of support are you seeking?");
  let aidType = "for aid from";
  let needs = services.join(", ");
  if (isEqual(services, ["Deliver groceries or supplies to me"])) {
    // eslint-disable-line
    aidType = "to deliver groceries to";
    needs = "Groceries / Shopping";
  }

  const extraFields = [
    ["Timeline", request.get("Time Sensitivity") || "When convenient"],
    ["Neighborhood", quadrant],
    ["Need", needs],
    ["Cross Streets", streets],
    ["Language", (request.get("Languages") || []).join("/")],
    ["Description", request.get("Intake General Notes")],
    ["Code", request.get("Code")]
  ];
  const status = ":red_circle:";
  const fieldRepresentation = extraFields
    .filter(kv => kv[1])
    .map(kv => `*${kv[0]}*: ${kv[1].trim()}`)
    .join("\n");
  // HACK: use non-breaking space as a delimiter between the status and the rest of the message: \u00A0
  return `${status}\u00A0Hey <!channel> we have a new request ${aidType} ${name} in *${quadrant}*:
${fieldRepresentation}
*Want to volunteer to help our neighbor?* Comment on this thread and <@${slackId}> will follow up with more details.
_Reminder: Please don’t volunteer for delivery if you have any COVID-19/cold/flu-like symptoms, or have come into contact with someone that’s tested positive._`;
}

/**
 * Guards a slack callback handler presenting an error response if there is an error.
 */
function guard(f) {
  return (payload, ...args) => {
    return f(payload, ...args).catch(e => {
      console.error("Got error when processing: %0", e);
      return slackapi.views.open({
        token: process.env.SLACK_BOT_TOKEN,
        trigger_id: payload.trigger_id,
        view: errorResponse(`Oops got an error: ${e}`)
      });
    });
  };
}
