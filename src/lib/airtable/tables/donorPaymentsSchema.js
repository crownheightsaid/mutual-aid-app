const { paymentsAirbase } = require("~airtable/bases");

const donorPaymentsTableName = (exports.donorPaymentsTableName =
  "DonorPayments");
const donorPaymentsTable = (exports.donorPaymentsTable = paymentsAirbase(
  donorPaymentsTableName
));
const fields = (exports.donorPaymentsFields = {
  id: "ID",
  amount: "Amount",
  donor: "Donor",
  donorSlackId: "DonorSlackId",
  paymentRequest: "PaymentRequest",
  donorConfirmation: "DonorConfirmation",
  donorConfirmation_options: {
    pending: "Pending",
    confirmed: "Confirmed",
    failed: "Failed",
  },
  recipientConfirmation: "RecipientConfirmation",
  recipientConfirmation_options: {
    confirmed: "Confirmed",
    pending: "Pending",
    failed: "Failed",
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
    pendingDonorMessaged: "PendingDonorMessaged",
  },
  amountToCountAsPaid: "AmountToCountAsPaid",
  created: "Created",
  code: "Code",
  lastModified: "Last Modified",
  disputes: "Disputes",
  meta: "Meta",
  lastProcessed: "Last Processed",
  donorMobile: "DonorMobile",
});
exports.fields = fields;
exports.donorPaymentsSensitiveFields = [fields.donorMobile];
