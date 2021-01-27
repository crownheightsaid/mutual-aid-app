const { sortBy } = require("lodash");
const slackapi = require("~slack/webApi");
const { findChannelByName, addBotToChannel } = require("~slack/channels");
const { errorResponse, errorView } = require("~slack/views");
const { REQUESTS_CHANNEL } = require("~slack/constants");
const guard = require("~slack/guard");
const { findVolunteerByEmail } = require("~airtable/tables/volunteers");
const {
  findOpenRequestsForSlack,
  findRequestByCode,
  updateRequestByCode,
} = require("~airtable/tables/requests");
const { fields: requestsFields } = require("~airtable/tables/requestsSchema");
const { str } = require("~strings/i18nextWrappers");

const {
  getDeliveryRequestNeedFormatted,
} = require("~airtable/deliveryrequests/getDeliveryRequestNeedFormatted");

const modalTitle = str(
  "slackapp:requestBotPost.modal.title",
  "Create Delivery Request"
);

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
    guard(selectRequestForSending),
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
  const slackUserResponse = await slackapi.users.info({
    token: process.env.SLACK_BOT_TOKEN,
    user: payload.user.id,
  });

  const slackUserEmail = slackUserResponse.user.profile.email;
  const [volRecord, verr] = await findVolunteerByEmail(slackUserEmail);
  let view = null;
  if (verr) {
    view = errorView(
      str("slackapp:requestBotPost.modal.error.noVolunteer", {
        defaultValue: `No volunteer with email: {{- userEmail}}. Did you use your slack email to sign up?`,
        userEmail: slackUserEmail,
      })
    );
    await slackapi.views.open({
      trigger_id: payload.trigger_id,
      view,
    });
    return;
  }
  let [requests, err] = await findOpenRequestsForSlack(); // eslint-disable-line
  requests = requests.filter((r) => {
    const vols = r.get(requestsFields.intakeVolunteer) || [];
    return vols.includes(volRecord.getId());
  });
  requests = sortBy(requests, (r) =>
    r.get(requestsFields.lastModified)
  ).reverse();

  if (err) {
    view = errorView(
      `${str("slackapp:requestBotPost.modal.error.pendingRequests")} ${err}`
    );
  } else if (requests.length === 0) {
    view = errorView(
      str("slackapp:requestBotPost.modal.error.noPendingRequests")
    );
  } else {
    view = await makeRequestSelectionView(requests);
  }
  await slackapi.views.open({
    trigger_id: payload.trigger_id,
    view,
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
    return errorResponse(
      `${str(
        "slackapp:requestBotPost.modal.error.requestNotFound"
      )}: ${code} ${err}`
    );
  }
  const form = await makeRequestDraftView(payload, request);
  return {
    response_action: "update",
    view: form,
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
    return errorResponse(
      `${str(
        "slackapp:requestBotPost.modal.error.requestNotFound"
      )}: ${code} ${err}`
    );
  }
  return {
    response_action: "push",
    view: makeConfirmationView(request, channel, content),
  };
}

/**
 * Posts the message to slack. The bot also sends a DM to the user with a link to the message
 * and updates the Request with the metadata for the message.
 */
async function sendMessage(payload) {
  const context = JSON.parse(payload.view.private_metadata);
  await addBotToChannel(context.channelId);

  // Send the message
  const deliveryMessage = await slackapi.chat.postMessage({
    channel: context.channelId,
    text: context.content,
    // We don't want any unfurling of links in the message
    unfurl_media: false,
    unfurl_links: false,
  });
  if (!deliveryMessage.ok) {
    return errorResponse(
      `Unable to send message to channel <#${context.channelId}>`
    );
  }

  // Update the metadata on the Request
  await updateRequestByCode(context.code, {
    [requestsFields.status]: requestsFields.status_options.deliveryNeeded,
    [requestsFields.meta]: {
      slack_ts: deliveryMessage.ts,
      slack_channel: deliveryMessage.channel,
    },
  });

  // Close the modal
  return {
    response_action: "clear",
  };
}

/**
 * Modal view for selecting a requeest to use for the rest of the flow
 */
async function makeRequestSelectionView(requests) {
  const options = requests.map((r) => {
    return {
      text: {
        type: "mrkdwn",
        text: `*${r.get(requestsFields.code)}* - ${
          r.get(requestsFields.phone) || r.get(requestsFields.email)
        } _${r.get(requestsFields.status)}_`,
      },
      value: r.get(requestsFields.code),
    };
  });
  const requestSelectionBlocks = {
    type: "modal",
    callback_id: draftRequest.id,
    clear_on_close: true,
    title: {
      type: "plain_text",
      text: modalTitle,
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: str("slackapp:requestBotPost.modal.picker.submit"),
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: str("common:cancel"),
      emoji: true,
    },
    blocks: [
      {
        block_id: "select_request",
        type: "input",
        element: {
          action_id: "selected_request",
          type: "radio_buttons",
          initial_option: options[0],
          options,
        },
        label: {
          type: "plain_text",
          text: str("slackapp:requestBotPost.modal.picker.message"),
          emoji: true,
        },
      },
    ],
  };
  return requestSelectionBlocks;
}

/**
 * Modal view for drafting a new request. Suggests a template automatically.
 */
async function makeRequestDraftView(payload, request) {
  const requestsChannel = await findChannelByName(REQUESTS_CHANNEL);
  const requestDraftBlocks = {
    type: "modal",
    callback_id: draftConfirm.id,
    private_metadata: request.get(requestsFields.code),
    title: {
      type: "plain_text",
      text: modalTitle,
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: str("slackapp:requestBotPost.modal.draft.submit"),
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: str("common:cancel"),
      emoji: true,
    },
    blocks: [
      {
        type: "input",
        block_id: "selected_channel",
        element: {
          type: "channels_select",
          action_id: "selected_channel",
          initial_channel: requestsChannel.id,
          placeholder: {
            type: "plain_text",
            text: str("slackapp:requestBotPost.modal.draft.channelSelect"),
            emoji: true,
          },
        },
        label: {
          type: "plain_text",
          text: "Channel",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "draft_message",
        element: {
          type: "plain_text_input",
          action_id: "draft_message",
          initial_value: suggestedTemplate(payload, request),
          multiline: true,
        },
        label: {
          type: "plain_text",
          text: str("slackapp:requestBotPost.modal.draft.label"),
          emoji: true,
        },
      },
    ],
  };
  return requestDraftBlocks;
}

/**
 * Modal view for confirming a delivery request
 */
function makeConfirmationView(request, channelId, content) {
  const code = request.get(requestsFields.code);
  const context = {
    code,
    channelId,
    content,
  };
  return {
    type: "modal",
    callback_id: sendMessage.id,
    private_metadata: JSON.stringify(context),
    title: {
      type: "plain_text",
      text: modalTitle,
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: str("slackapp:requestBotPost.modal.confirm.submit"),
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: str("slackapp:requestBotPost.modal.confirm.edit"),
      emoji: true,
    },
    blocks: [
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Request*: ${request.get(
              requestsFields.code
            )}\n*Channel*: <#${channelId}>`,
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: content,
          },
        ],
      },
    ],
  };
}

/**
 * Generates the suggested slack message given a request
 */
function suggestedTemplate(payload, request) {
  const slackId = payload.user.id;
  const streets = [
    request.get(requestsFields.crossStreetFirst),
    request.get(requestsFields.crossStreetSecond),
  ]
    .filter((s) => s !== undefined)
    .join(" & ");

  const mapUrl = str("slackapp:requestBotPost.post.fields.streets.mapUrl", {
    defaultValue: `https://crownheightsma.herokuapp.com/delivery-needed?request={{requestCode}}`,
    requestCode: request.get(requestsFields.code),
  });

  const streetsURL = str(
    "slackapp:requestBotPost.post.fields.streets.streetsWithMapUrl",
    {
      defaultValue: `<{{- mapUrl}}|{{streets}}>`,
      mapUrl,
      streets,
    }
  );

  let quadrant = request.get(requestsFields.neighborhoodArea);
  const { nw, sw, ne, se } = requestsFields.neighborhoodArea_options;
  if ([nw, sw, ne, se].includes(quadrant)) {
    quadrant += ` ${str("common:neighborhood")}`;
  }

  let firstName = request.get(requestsFields.firstName);
  firstName = firstName ? ` ${firstName}` : "";

  const needs = getDeliveryRequestNeedFormatted(
    request.get(requestsFields.supportType)
  );

  const extraFields = [
    [
      str("slackapp:requestBotPost.post.fields.timeline.name", "Timeline"),
      request.get(requestsFields.timeSensitivity) ||
        str(
          "slackapp:requestBotPost.post.fields.timeline.default",
          "When convenient"
        ),
    ],
    [
      str("slackapp:requestBotPost.post.fields.neighborhood.name"),
      quadrant ||
        str("slackapp:requestBotPost.post.fields.neighborhood.default"),
    ],
    [
      str("slackapp:requestBotPost.post.fields.householdSize"),
      request.get(requestsFields.householdSize) || str("common:notAvailable"),
    ],
    [str("slackapp:requestBotPost.post.fields.needs.name"), needs],
    [str("slackapp:requestBotPost.post.fields.streets.name"), streetsURL],
    [
      str("slackapp:requestBotPost.post.fields.language.name"),
      (request.get(requestsFields.languages) || []).join("/"),
    ],
    [
      str("slackapp:requestBotPost.post.fields.notes.name"),
      request.get(requestsFields.intakeNotes) ||
        str("slackapp:requestBotPost.post.fields.notes.default"),
    ],
    ["Code", request.get(requestsFields.code)], // No str because we need to regex it after
  ];
  const status = str("slackapp:requestBotPost.post.statusPrefix.default");
  const fieldRepresentation = extraFields
    .filter((kv) => kv[1])
    .map((kv) => `*${kv[0]}*: ${kv[1].trim()}`)
    .join("\n");
  // HACK: use non-breaking space as a delimiter between the status and the rest of the message: \u00A0
  return `${status}\u00A0${str("slackapp:requestBotPost.post.message.intro", {
    defaultValue: `Hey <!channel> we have a new request from our neighbor {{firstName}} at {{streets}} in *{{quadrant}}*`,
    firstName,
    streets,
    quadrant,
  })}:
${fieldRepresentation}
${str("slackapp:requestBotPost.post.message.outro", {
  defaultValue: `*Want to volunteer to help our neighbor{{firstName}}?* Comment on this thread and {{- intakeSlackId}} will follow up with more details.
_Reminder: Please don’t volunteer for delivery if you have any COVID-19/cold/flu-like symptoms, or have come into contact with someone that’s tested positive._`,
  intakeSlackId: `<@${slackId}>`,
  firstName,
})}
${str("slackapp:requestBotPost.post.message.guide", {
  defaultValue: `For more information, please see the <{{- guideUrl}}|delivery guide>`,
  guideUrl: str("common:links.deliveryGuide"),
})}`;
}
