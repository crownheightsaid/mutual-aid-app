const slackapi = require("~slack/webApi");
const { findChannelByName } = require("~slack/channels");
const { REIMBURSEMENT_CHANNEL } = require("~slack/constants");
const {
  findPaymentRequestBySlackThreadId,
} = require("~airtable/tables/paymentRequests");
const {
  paymentRequestsFields,
} = require("~airtable/tables/paymentRequestsSchema");
const { createDonorPayment } = require("~airtable/tables/donorPayments");

const { donorPaymentsFields } = require("~airtable/tables/donorPaymentsSchema");

module.exports.register = function register(slackEvents) {
  slackEvents.on("message", filterAndReply);
};

const filterAndReply = async (event) => {
  if (event.bot_id) {
    return;
  }

  let reimbursementChannel;

  try {
    reimbursementChannel = await findChannelByName(REIMBURSEMENT_CHANNEL);
    if (!isReimbursementReply(event, reimbursementChannel.id)) {
      return;
    }
  } catch (e) {
    console.error("Error finding reimbursement channel", e);
    return;
  }

  let paymentRequest;
  try {
    [paymentRequest] = await findPaymentRequestBySlackThreadId(event.thread_ts);
    if (!paymentRequest) {
      console.log("paymentRequest not posted by bot.");
      return;
    }
  } catch (e) {
    console.error("Error fetching payment request by Slack thread ID", e);
    return;
  }

  const amountMatches = findAmountsInString(event.text);
  if (!amountMatches || amountMatches.length === 0) {
    console.log(`No money matches found in: ${event.text}`);
    return;
  }

  const newDonationAmount = Number(amountMatches[0]);

  try {
    const [record] = await createDonorPayment({
      [donorPaymentsFields.amount]: newDonationAmount,
      [donorPaymentsFields.paymentRequest]: [paymentRequest.getId()],
      [donorPaymentsFields.status]: donorPaymentsFields.status_options.pending,
      [donorPaymentsFields.donorSlackId]: event.user,
      [donorPaymentsFields.recipientConfirmation]:
        donorPaymentsFields.recipientConfirmation_options.pending,
      [donorPaymentsFields.donorConfirmation]:
        donorPaymentsFields.donorConfirmation_options.confirmed,
    });

    if (!record) {
      console.log("Couldn't add donor's payment");
      return;
    }
  } catch (e) {
    console.error("Error adding donor payment", e);
    return;
  }

  const oldBalance = paymentRequest.get(paymentRequestsFields.balance);
  const newBalance = oldBalance - newDonationAmount;
  const message =
    newBalance <= 0
      ? "reimbursement is complete!!"
      : `just ${newBalance.toFixed(2)} to go!`;

  try {
    await slackapi.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: reimbursementChannel.id,
      thread_ts: event.thread_ts,
      text: `Thanks <@${event.user}>!
      They sent ${newDonationAmount.toFixed(2)}, ${message}`,
    });
  } catch (e) {
    console.error("Error posting reimbursement message", e);
  }
};

const findAmountsInString = (text) => {
  return text.replace(/<.{0,15}>/g, "").match(/\d+\.?\d*/g);
};

const isReimbursementReply = (event, reimbursementChannelId) => {
  return event.channel === reimbursementChannelId && event.parent_user_id;
};

module.exports.filterAndReply = filterAndReply;
