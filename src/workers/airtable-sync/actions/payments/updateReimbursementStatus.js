const slackapi = require("~slack/webApi");
const { findChannelByName, getExistingMessage } = require("~slack/channels");
const { paymentRequestsFields } = require("~airtable/tables/paymentRequests");
const { REIMBURSEMENT_CHANNEL } = require("~slack/constants");
const { str } = require("~strings/i18nextWrappers");

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
  const contentWithoutStatus = content.replace(/^(.|[\r\n])*\u00A0/, "");
  console.log(contentWithoutStatus);
  const newContent = `${statusBadge}\u00A0${contentWithoutStatus}`;
  console.log(newContent);

  await slackapi.chat.update({
    channel: reimbursementChannel.id,
    ts: slackThreadId,
    text: newContent,
  });
};

function getStatusBadge(record) {
  const isPaid = record.get(paymentRequestsFields.isPaid);
  if (isPaid) {
    return str(
      "slackapp:reimbursementBotPost.post.statusPrefix.completed",
      ":heavy_check_mark: REIMBURSED\n"
    );
  }
  return str(
    "slackapp:reimbursementBotPost.post.statusPrefix.default",
    ":red_circle:"
  );
}
