const { paymentsAirbase } = require("~airtable/bases");

exports.createDonorPayment = async donorPayment => {
  console.debug("creating donor payments record");
  try {
    const record = await donorPaymentsTable.create(donorPayment);
    return [record, null];
  } catch (e) {
    console.error(`Couldn't create request: ${e}`);
    return [null, e];
  }
};

exports.findDonorPaymentByCode = async code => {
  try {
    const andConditions = [
      `{${fields.code}} = "${code}"`,
      `{${fields.status}} != "${fields.status_options.completed}"`,
      `{${fields.status}} != "${fields.status_options.failedNoAnswer}"`,
      `{${fields.status}} != "${fields.status_options.failedDonorBackedOut}"`
    ];
    const record = await donorPaymentsTable
      .select({
        filterByFormula: `And(${andConditions.join(",")})`
      })
      .firstPage();
    return record
      ? [record[0], null]
      : [null, "Valid payment with that code not found"];
  } catch (e) {
    console.error(`Error while fetching request by code ${code}: ${e}`); // TODO cargo culted from above, what is this intended to rescue?
    return [null, e.message];
  }
};

// ==================================================================
// Schema
// ==================================================================

const donorPaymentsTableName = (exports.tableName = "DonorPayments");
const donorPaymentsTable = (exports.table = paymentsAirbase(
  donorPaymentsTableName
));
const fields = (exports.fields = {
  id: "ID",
  amount: "Amount",
  donor: "Donor",
  paymentRequest: "PaymentRequest",
  donorConfirmation: "DonorConfirmation",
  donorConfirmation_options: {
    pending: "Pending",
    confirmed: "Confirmed",
    failed: "Failed"
  },
  recipientConfirmation: "RecipientConfirmation",
  recipientConfirmation_options: {
    confirmed: "Confirmed",
    pending: "Pending",
    failed: "Failed"
  },
  status: "Status",
  status_options: {
    pending: "Pending",
    disputePendingNotes: "DisputePendingNotes",
    disputeResolvedFailed: "DisputeResolvedFailed",
    disputeResolvedCompleted: "DisputeResolvedCompleted",
    completed: "Completed",
    failedNoAnswer: "FailedNoAnswer",
    disputePendingResolution: "DisputePendingResolution",
    failedDonorBackedOut: "FailedDonorBackedOut",
    pendingRecipientMessaged: "PendingRecipientMessaged",
    pendingDonorMessaged: "PendingDonorMessaged"
  },
  amountToCountAsPaid: "AmountToCountAsPaid",
  created: "Created",
  code: "Code",
  lastModified: "Last Modified",
  disputes: "Disputes",
  toBalancer: "ToBalancer",
  fromBalancer: "FromBalancer",
  meta: "Meta",
  lastProcessed: "Last Processed",
  donorMobile: "DonorMobile",
  recipientMobile: "RecipientMobile",
  toBalancerMobile: "ToBalancerMobile",
  payerMobile: "PayerMobile",
  fromBalancerMobile: "FromBalancerMobile",
  payeeMobile: "PayeeMobile"
});
