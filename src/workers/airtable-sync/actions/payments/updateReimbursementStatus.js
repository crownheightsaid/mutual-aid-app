const slackapi = require("~slack/webApi");
const { findChannelByName } = require("~slack/channels");
const { paymentRequestsFields } = require("~airtable/tables/paymentRequests");
const { REIMBURSEMENT_CHANNEL } = require("~slack/constants");

/**
 * Updates the slack payment request message to account for completion.
 */
module.exports = async function updateMessage(paymentRequest) {
  const slackThreadId = paymentRequest.get(paymentRequestsFields.slackThreadId);
  if (!slackThreadId) {
    return;
  }
  const reimbursementChannel = await findChannelByName(REIMBURSEMENT_CHANNEL);
  const existingMessage = await getExistingMessage(
    slackThreadId,
    reimbursementChannel.id
  );

  if (existingMessage == null) {
    console.log(
      `No existing message for payment request: ${paymentRequest.getId()}`
    );
    return;
  }
  const content = existingMessage.text;
  console.log(content);

  // Set up the status emoji/phrase
  // HACK: use non-breaking space as a delimiter between the status and the rest of the message: \u00A0
  const statusBadge = getStatusBadge(paymentRequest);
  const contentWithoutStatus = content.replace(/.*\u00A0/, "");
  console.log(contentWithoutStatus);
  const newContent = `${statusBadge}\u00A0${contentWithoutStatus}`;
  console.log(newContent);

  await slackapi.chat.update({
    channel: reimbursementChannel.id,
    ts: slackThreadId,
    text: newContent
  });
};

function getStatusBadge(record) {
  const isPaid = record.get(paymentRequestsFields.isPaid);
  if (isPaid) {
    return ":white_check_mark: REIMBURSED\n";
  }
  return ":red_circle:";
}

async function getExistingMessage(ts, channel) {
  const message = await slackapi.conversations.history({
    channel,
    latest: ts,
    limit: 1,
    inclusive: true
  });
  if (!message.messages[0]) {
    return null;
  }
  return message.messages[0];
}
