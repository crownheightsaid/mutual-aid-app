const slackapi = require("~slack/webApi");
const { findChannelByName, addBotToChannel } = require("~slack/channels");
const { REIMBURSEMENT_CHANNEL } = require("~slack/constants");
const {
  volunteersFields,
  findVolunteerById
} = require("~airtable/tables/volunteers");
const {
  paymentRequestsFields,
  paymentRequestsTable,
  findPaymentRequestByCode
} = require("~airtable/tables/paymentRequests");
const {
  fields: requestFields,
  findRequestByCode
} = require("~airtable/tables/requests");
const { str } = require("~strings/i18nextWrappers");

module.exports = async function newPaymentRequest(record) {
  const reimbursementChannel = await findChannelByName(REIMBURSEMENT_CHANNEL);
  await addBotToChannel(reimbursementChannel.id);

  const code = record.get(paymentRequestsFields.requestCode).toUpperCase();
  const [existingPaymentRequest, _e] = await findPaymentRequestByCode(code);
  if (
    existingPaymentRequest &&
    existingPaymentRequest.get(paymentRequestsFields.slackThreadId)
  ) {
    await handleExistingPaymentRequest(
      existingPaymentRequest,
      code,
      reimbursementChannel
    );
    return;
  }

  const [request, _rErr] = await findRequestByCode(code);
  // lookup if reimbursement request already exists for that code
  console.debug(
    `New Payment Request: ${record.get(
      paymentRequestsFields.id
    )} | ${code} | ${record.get(paymentRequestsFields.amount)} | ${record.get(
      paymentRequestsFields.created
    )}`
  );

  const messageText = await makeMessageText(record, request, code);
  const deliveryMessage = await slackapi.chat.postMessage({
    channel: reimbursementChannel.id,
    unfurl_media: false,
    text: messageText
  });
  if (!deliveryMessage.ok) {
    console.debug(`Couldn't post payment request: ${code}`);
    return;
  }

  await paymentRequestsTable.update([
    {
      id: record.getId(),
      fields: { [paymentRequestsFields.slackThreadId]: deliveryMessage.ts }
    }
  ]);
};

async function makeMessageText(reimbursement, request, reimbursementCode) {
  const firstName = reimbursement.get(paymentRequestsFields.firstName);
  const delivererSlackId = request.get(requestFields.deliverySlackId);
  const deliveryUser = delivererSlackId ? `<@${delivererSlackId}>` : null;
  const intro = str("slackapp:reimbursementBotPost.post.message.intro", {
    defaultValue: `Hey neighbors! {{- deliverer}} completed a delivery and could use reimbursement! :tada::tada:`,
    deliverer: deliveryUser || firstName || "A neighbor"
  });

  const paymentMethods = [];
  const venmoId = reimbursement.get(paymentRequestsFields.venmoId);
  if (venmoId) {
    paymentMethods.push(["Venmo", venmoId]);
  }
  const paypalId = reimbursement.get(paymentRequestsFields.paypalId);
  if (paypalId) {
    paymentMethods.push(["Paypal", paypalId]);
  }
  const cashAppId = reimbursement.get(paymentRequestsFields.cashAppId);
  if (cashAppId) {
    paymentMethods.push(["Cash App", cashAppId]);
  }
  if (paymentMethods.length === 0) {
    paymentMethods.push(["Payment Methods", cashAppId]);
  }

  let intakeVol = null;
  if (request) {
    [intakeVol] = await findVolunteerById(
      request.get(requestFields.intakeVolunteer)
    );
  }
  const intakeVolField = [];
  if (intakeVol && intakeVol.get(volunteersFields.slackId)) {
    intakeVolField.push([
      "Intake Volunteer",
      `<@${intakeVol.get(volunteersFields.slackId)}>`
    ]);
  }

  const receipts = reimbursement.get(paymentRequestsFields.receipts) || [];
  const receiptFields = [];
  receipts.forEach((receipt, i) => {
    receiptFields.push([
      i ? `Receipt ${i + 1}` : "Receipt",
      `<${receipt.url}|link>`
    ]);
  });

  const slackMessage = reimbursement.get(paymentRequestsFields.slackMessage);
  const extraFields = [
    [
      "Code",
      reimbursementCode ||
        str(
          "slackapp:reimbursementBotPost.post.fields.code.default",
          "@chma-admins this request is missing a code!"
        )
    ],
    [
      "Message",
      slackMessage ? `-\n${slackMessage}` : str("common:notAvailable")
    ],
    [
      "Amount Needed",
      `$${reimbursement.get(paymentRequestsFields.reimbursementAmount)}`
    ],
    ...paymentMethods,
    ...intakeVolField,
    ...receiptFields
  ];
  const status = str("slackapp:reimbursementBotPost.post.statusPrefix.default");
  const fieldRepresentation = extraFields
    .filter(kv => kv[1])
    .map(kv => `*${kv[0]}*: ${kv[1].trim()}`)
    .join("\n");
  // HACK: use non-breaking space as a delimiter between the status and the rest of the message: \u00A0
  return `${status}\u00A0${intro}:\n${fieldRepresentation}
  
${str("slackapp:reimbursementBotPost.post.message.outro")}`;
}

const handleExistingPaymentRequest = async (
  existingPaymentRequest,
  code,
  reimbursementChannel
) => {
  console.log(`Handling duplicate paymentRequest for code: ${code}`);
  const existingThreadId = existingPaymentRequest.get(
    paymentRequestsFields.slackThreadId
  );
  const existingThreadLink = await slackapi.chat.getPermalink({
    channel: reimbursementChannel.id,
    message_ts: existingThreadId
  });
  const existingMessage = str(
    "slackapp:reimbursementBotPost.duplicatePost.message",
    {
      defaultValue:
        "*Duplicate Code!*\nThere is already a reimbursement post in this channel for request code {{- code}}. Here is a link to the original post. If there's an issue, please tag @chma-admins!\n{{- threadLink}}",
      code,
      threadLink: existingThreadLink
    }
  );
  const deliveryMessage = await slackapi.chat.postMessage({
    channel: reimbursementChannel.id,
    unfurl_media: false,
    text: existingMessage
  });
  if (!deliveryMessage.ok) {
    console.debug(`Couldn't post duplicate payment request: ${code}`);
  }
};
