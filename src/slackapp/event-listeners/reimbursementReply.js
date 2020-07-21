const slackapi = require("~slack/webApi");
const { findChannelByName } = require("~slack/channels");
const { REIMBURSEMENT_CHANNEL } = require("~slack/constants");
const {
  findPaymentRequestBySlackThreadId,
  paymentRequestsFields
} = require("~airtable/tables/paymentRequests");
const {
  createDonorPayment,
  donorPaymentsFields
} = require("~airtable/tables/donorPayments");

module.exports.register = function register(slackEvents) {
  slackEvents.on("message", filterAndReply);
};

const filterAndReply = async event => {
  if (event.bot_id) {
    return;
  }
  const reimbursementChannel = await findChannelByName(REIMBURSEMENT_CHANNEL);
  if (!isReimbursementReply(event, reimbursementChannel.id)) {
    return;
  }
  const [paymentRequest] = await findPaymentRequestBySlackThreadId(
    event.thread_ts
  );
  if (!paymentRequest) {
    console.log("paymentRequest not posted by bot.");
    return;
  }
  const amountMatches = findAmountsInString(event.text);
  if (!amountMatches || amountMatches.length === 0) {
    console.log(`No money matches found in: ${event.text}`);
    return;
  }

  const newDonationAmount = Number(amountMatches[0]);

  const [record] = await createDonorPayment({
    [donorPaymentsFields.amount]: newDonationAmount,
    [donorPaymentsFields.paymentRequest]: [paymentRequest.getId()],
    [donorPaymentsFields.status]: donorPaymentsFields.status_options.pending,
    [donorPaymentsFields.donorSlackId]: event.user,
    [donorPaymentsFields.recipientConfirmation]:
      donorPaymentsFields.recipientConfirmation_options.pending,
    [donorPaymentsFields.donorConfirmation]:
      donorPaymentsFields.donorConfirmation_options.confirmed
  });
  if (!record) {
    console.log("Couldn't add donor's payment");
    return;
  }

  const oldBalance = paymentRequest.get(paymentRequestsFields.balance);
  const newBalance = oldBalance - newDonationAmount;
  const message =
    newBalance <= 0
      ? "reimbursement is complete!!"
      : `just ${newBalance.toFixed(2)} to go!`;
  await slackapi.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: reimbursementChannel.id,
    thread_ts: event.thread_ts,
    text: `Thanks <@${event.user}>!
They sent ${newDonationAmount.toFixed(2)}, ${message}`
  });
};

const findAmountsInString = text => {
  return text.replace(/<.{0,15}>/g, "").match(/\d+\.?\d*/g);
};

const isReimbursementReply = (event, reimbursementChannelId) => {
  return event.channel === reimbursementChannelId && event.parent_user_id;
};
