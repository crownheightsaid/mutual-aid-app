const { paymentsAirbase } = require("~airtable/bases");

const paymentRequestsTableName = (exports.paymentRequestsTableName =
  "PaymentRequests");
exports.paymentRequestsTable = paymentsAirbase(paymentRequestsTableName);
const fields = (exports.paymentRequestsFields = {
  id: "ID",
  amount: "Amount",
  receipts: "Receipts",
  donation: "Donation",
  reimbursementAmount: "ReimbursementAmount",
  requestCode: "RequestCode",
  donorPayments: "DonorPayments",
  isPaid: "IsPaid",
  created: "Created",
  balance: "Balance",
  lastModified: "Last Modified",
  venmoId: "VenmoID",
  paypalId: "PaypalID",
  cashAppId: "CashAppID",
  firstName: "FirstName",
  slackMessage: "SlackMessage",
  slackThreadId: "SlackThreadId",
  adminNotificationSent: "AdminNotificationSent",
  adminDenialMessage: "AdminDenialMessage",
  phone: "Phone",
  approval: "Approval",
  approval_options: {
    approved: "Approved",
    denied: "Denied",
  },
  paidAmount: "PaidAmount",
  meta: "Meta",
  lastProcessed: "Last Processed",
  type: "Type",
  type_options: {
    preimbursement: "Preimbursement",
    reimbursement: "Reimbursement",
    directAid: "Direct Aid",
  },
});
exports.fields = fields;
exports.paymentRequestsSensitiveFields = [
  fields.phone,
  fields.venmoId,
  fields.paypalId,
  fields.cashAppId,
];
