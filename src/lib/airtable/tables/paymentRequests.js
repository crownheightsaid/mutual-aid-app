const { merge } = require("lodash");
const { paymentsAirbase } = require("~airtable/bases");

// `update` should look like:
// {
//   "Some Requests Field": "New Value",
//   "Another field": "Another New Value"
//   "Meta": {key: "value"}
// }
exports.updatePaymentRequestByCode = async (code, update) => {
  try {
    const records = await paymentRequestsTable
      .select({
        filterByFormula: `(FIND('${code}', {${fields.requestCode}}) > 0)`
      })
      .firstPage();
    if (records.length === 0) {
      return [null, `No requests found with code: ${code}`];
    }
    if (update[fields.meta]) {
      // Support for updating Meta as an object (rather than string)
      /* eslint no-param-reassign: ["error", { "props": false }] */
      const parsed = JSON.parse(records[0].get(fields.meta));
      merge(parsed, update[fields.meta]);
      update[fields.meta] = JSON.stringify(parsed);
    }
    const record = records[0];
    const airUpdate = {
      id: record.id,
      fields: update
    };
    const updatedRecords = await paymentRequestsTable.update([airUpdate]);
    return [updatedRecords[0], null];
  } catch (e) {
    return [null, `Error while processing update: ${e}`];
  }
};

exports.findPaymentRequestsInSlack = async code => {
  if (code && code.length < 4) {
    return [null, `Request code must be at least 4 characters.`];
  }
  try {
    const records = await paymentRequestsTable
      .select({
        filterByFormula: `AND((FIND('${code}', {${fields.requestCode}}) > 0), {${fields.slackThreadId}})`
      })
      .firstPage();
    if (records.length === 0) {
      return [null, "No paymentrequests found with that code."];
    }
    const record = records[0];
    return [record, null];
  } catch (e) {
    return [null, `Error while finding request: ${e}`];
  }
};

exports.findPaymentRequestBySlackThreadId = async threadId => {
  try {
    const record = await paymentRequestsTable
      .select({
        filterByFormula: `({${fields.slackThreadId}} = '${threadId}')`
      })
      .firstPage();
    return record
      ? [record[0], null]
      : [null, "Request with that thread ID not found"];
  } catch (e) {
    console.error(`Error while fetching request by thread ID: ${e}`);
    return [null, e];
  }
};

exports.findPaymentRequestById = async id => {
  try {
    return [await paymentRequestsTable.find(id), null];
  } catch (e) {
    return [null, `Errors looking up payment request by recordId ${id}: ${e}`];
  }
};

exports.findReimbursablePaymentRequests = async () => {
  const andConditions = [
    `{${fields.approval}} = "${fields.approval_options.approved}"`,
    `{${fields.paid}} = 0`
  ];
  try {
    const records = await paymentRequestsTable
      .select({
        filterByFormula: `And(${andConditions.join(",")})`,
        sort: [{ field: fields.created, direction: "asc" }]
      })
      .firstPage();
    return records ? [records, null] : [null, "No pending payment requests"];
  } catch (e) {
    console.error(`Error while fetching reimbursable payment requests ${e}`); // TODO cargo culted from above, what is this rescuing?
    return [null, e.message];
  }
};

// ==================================================================
// Schema
// ==================================================================

const paymentRequestsTableName = (exports.paymentRequestsTableName =
  "PaymentRequests");
const paymentRequestsTable = (exports.paymentRequestsTable = paymentsAirbase(
  paymentRequestsTableName
));
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
    denied: "Denied"
  },
  paidAmount: "PaidAmount",
  meta: "Meta",
  lastProcessed: "Last Processed",
  type: "Type",
  type_options: {
    preimbursement: "Preimbursement",
    reimbursement: "Reimbursement",
    directAid: "Direct Aid"
  }
});
exports.paymentRequestsSensitiveFields = [
  fields.phone,
  fields.venmoId,
  fields.paypalId,
  fields.cashAppId
];
