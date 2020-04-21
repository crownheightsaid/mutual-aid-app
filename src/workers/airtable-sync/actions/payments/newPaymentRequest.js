const slackapi = require("~slack/webApi");
const { findChannelByName, addBotToChannel } = require("~slack/channels");
const { REIMBURSEMENT_CHANNEL } = require("~constants");
const {
  fields: volunteerFields,
  findVolunteerById
} = require("~airtable/tables/volunteers");
const {
  fields: paymentRequestFields,
  table: paymentRequestsTable
} = require("~airtable/tables/paymentRequests");
const {
  fields: requestFields,
  findRequestByCode
} = require("~airtable/tables/requests");

module.exports = async function newPaymentRequest(record) {
  const reimbursementChannel = await findChannelByName(REIMBURSEMENT_CHANNEL);
  await addBotToChannel(reimbursementChannel.id);

  const code = record.get(paymentRequestFields.requestCode).toUpperCase();
  const [request, _rErr] = await findRequestByCode(code);
  // lookup if reimbursement request already exists for that code
  console.debug(
    `New Payment Request: ${record.get(
      paymentRequestFields.id
    )} | ${code} | ${record.get(paymentRequestFields.amount)} | ${record.get(
      paymentRequestFields.created
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
      fields: { [paymentRequestFields.slackThreadId]: deliveryMessage.ts }
    }
  ]);
};

async function makeMessageText(reimbursement, request, reimbursementCode) {
  let intro = "Another delivery has been completed and could use reimbursement";
  const firstName = reimbursement.get(paymentRequestFields.firstName);
  if (firstName) {
    intro = `${firstName} completed a delivery and could use reimbursement`;
  }

  const paymentMethods = [];
  const venmoId = reimbursement.get(paymentRequestFields.venmoId);
  if (venmoId) {
    paymentMethods.push(["Venmo", venmoId]);
  }
  const paypalId = reimbursement.get(paymentRequestFields.paypalId);
  if (paypalId) {
    paymentMethods.push(["Paypal", paypalId]);
  }
  const cashAppId = reimbursement.get(paymentRequestFields.cashAppId);
  if (cashAppId) {
    paymentMethods.push(["Cash App", cashAppId]);
  }
  if (paymentMethods.length === 0) {
    paymentMethods.push(["Payment Methods", cashAppId]);
  }

  const donation = reimbursement.get(paymentRequestFields.donation);
  const donationField = [];
  if (donation) {
    donationField.push([
      "Deliverer Donation",
      `$${reimbursement.get(paymentRequestFields.donation)}`
    ]);
  }

  let intakeVol = null;
  if (request) {
    [intakeVol] = await findVolunteerById(
      request.get(requestFields.intakeVolunteer)
    );
  }
  const intakeVolField = [];
  if (intakeVol && intakeVol.get(volunteerFields.slackId)) {
    intakeVolField.push([
      "Intake Volunteer",
      `<@${intakeVol.get(volunteerFields.slackId)}>`
    ]);
  }

  const receipts = reimbursement.get(paymentRequestFields.receipts) || [];
  const receiptFields = [];
  receipts.forEach((receipt, i) => {
    receiptFields.push([
      i ? `Receipt ${i + 1}` : "Receipt",
      `<${receipt.url}|link>`
    ]);
  });

  const slackMessage = reimbursement.get(paymentRequestFields.slackMessage);
  const extraFields = [
    [
      "Code",
      reimbursementCode || "@chma-admins this request is missing a code!"
    ],
    ["Message", slackMessage ? `-\n${slackMessage}` : "None provided"],
    ...donationField,
    [
      "Amount Needed",
      `$${reimbursement.get(paymentRequestFields.reimbursementAmount)}`
    ],
    ...paymentMethods,
    ...intakeVolField,
    ...receiptFields
  ];
  const status = ":red_circle:";
  const fieldRepresentation = extraFields
    .filter(kv => kv[1])
    .map(kv => `*${kv[0]}*: ${kv[1].trim()}`)
    .join("\n");
  // HACK: use non-breaking space as a delimiter between the status and the rest of the message: \u00A0
  return `${status}\u00A0Hey neighbors! ${intro}:\n${fieldRepresentation}
  
*Want to send money?* Please send any amount to a payment method above and then reply to this post with the amount sent.
The bot isn't smart and will register the first number it finds, so please try and only include one dollar amount!
This example works fine:\n> Sent 20!`;
}
