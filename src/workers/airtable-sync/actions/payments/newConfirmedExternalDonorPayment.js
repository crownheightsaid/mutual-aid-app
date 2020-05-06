const slackapi = require("~slack/webApi");
const { findChannelByName } = require("~slack/channels");
const { REIMBURSEMENT_CHANNEL } = require("~slack/constants");
const { donorsFields, findDonorById } = require("~airtable/tables/donors");
const {
  paymentRequestsFields,
  findPaymentRequestById
} = require("~airtable/tables/paymentRequests");
const { donorPaymentsFields } = require("~airtable/tables/donorPayments");

module.exports = async function newConfirmedExternalDonorPayment(record) {
  const reimbursementChannel = await findChannelByName(REIMBURSEMENT_CHANNEL);
  const dpId = record.get(donorPaymentsFields.id);
  console.debug(
    `New Confirmed External Donor Payment: ${dpId} |  $${record.get(
      donorPaymentsFields.amount
    )}`
  );

  const prId = record.get(donorPaymentsFields.paymentRequest);
  const [paymentRequest] = await findPaymentRequestById(prId);
  const slackThreadId = paymentRequest.get(paymentRequestsFields.slackThreadId);

  const dId = record.get(donorPaymentsFields.donor);
  const [donor] = await findDonorById(dId);
  const nameMessage =
    donor && donor.get(donorsFields.firstName)
      ? `${donor.get(donorsFields.firstName)}, a pledge`
      : `A pledge`;

  const newDonationAmount = record.get(donorPaymentsFields.amount);
  const balance = paymentRequest.get(paymentRequestsFields.balance);
  const message =
    balance <= 0 ? "Reimbursement is complete!!" : `Just ${balance} to go!`;

  await slackapi.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: reimbursementChannel.id,
    thread_ts: slackThreadId,
    text: `Confirmed! ${nameMessage}, has sent you $${newDonationAmount}. ${message}`
  });
};
