const { paymentsAirbase } = require("~airtable/bases");

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

const paymentRequestsTableName = (exports.tableName = "PaymentRequests");
const paymentRequestsTable = (exports.table = paymentsAirbase(
  paymentRequestsTableName
));
const fields = (exports.fields = {
  id: "ID",
  amount: "Amount",
  receipts: "Receipts",
  donation: "Donation",
  reimbursementAmount: "ReimbursementAmount",
  requestCode: "RequestCode",
  donorPayments: "DonorPayments",
  paid: "Paid",
  created: "Created",
  lastModified: "Last Modified",
  venmoId: "VenmoID",
  firstName: "FirstName",
  adminNotificationSent: "AdminNotificationSent",
  adminDenialMessage: "AdminDenialMessage",
  phone: "Phone",
  approval: "Approval",
  approval_options: {
    approved: "Approved",
    denied: "Denied"
  },
  paypalId: "PaypalID",
  cashAppId: "CashAppID",
  publicReimbursementMessageSent: "PublicReimbursementMessageSent",
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
exports.sensitiveFields = [
  fields.phone,
  fields.venmoId,
  fields.paypalId,
  fields.cashAppId
];
