const slackapi = require("~slack/webApi");
const { findChannelByName } = require("~slack/channels");
const { REIMBURSEMENT_CHANNEL } = require("~slack/constants");
const {
  fields: paymentRequestFields,
  findPaymentRequestById
} = require("~airtable/tables/paymentRequests");
const { donorPaymentFields } = require("~airtable/tables/donorPayments");

module.exports = async function newExternalDonorPayment(record) {
  const reimbursementChannel = await findChannelByName(REIMBURSEMENT_CHANNEL);
  const dpId = record.get(donorPaymentFields.id);
  console.debug(
    `New External Donor Payment: ${dpId} |  $${record.get(
      donorPaymentFields.amount
    )}`
  );

  const prId = record.get(donorPaymentFields.paymentRequest);
  const [paymentRequest] = await findPaymentRequestById(prId);
  if (!paymentRequest) {
    console.debug(`No payment request for donor payment: ${dpId}`);
    return;
  }
  const slackThreadId = paymentRequest.get(paymentRequestFields.slackThreadId);
  if (!slackThreadId) {
    console.debug(
      `No slack thread for payment request: ${paymentRequest.get(
        paymentRequestFields.id
      )}`
    );
    return;
  }

  const newDonationAmount = record.get(donorPaymentFields.amount);
  const balance = paymentRequest.get(paymentRequestFields.balance);
  const message =
    balance <= 0 ? "reimbursement is complete!!" : `just ${balance} to go!`;

  await slackapi.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: reimbursementChannel.id,
    thread_ts: slackThreadId,
    text: `New donation by an external donor. They sent ${newDonationAmount}, ${message}`
  });
};
