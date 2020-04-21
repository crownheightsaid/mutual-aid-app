const ChangeDetector = require("airtable-change-detector");
const {
  donorPaymentsTable,
  donorPaymentFields,
  sensitiveDonorPaymentFields
} = require("~airtable/tables/donorPayments");
const {
  table: paymentRequestsTable,
  fields: paymentRequestFields,
  SENSITIVE_FIELDS: sensitivePaymentRequestFields
} = require("~airtable/tables/paymentRequests");
const newExternalDonorPayment = require("./actions/payments/newExternalDonorPayment");
const newPaymentRequest = require("./actions/payments/newPaymentRequest");
const updateReimbursementMessage = require("./actions/payments/updateReimbursementStatus");

const defaultInterval = 10000;

function startWorker(interval) {
  let pollInterval = interval;
  if (pollInterval < defaultInterval) {
    console.log(
      `Interval ${pollInterval} is too low. Clamping to ${defaultInterval}`
    );
    pollInterval = defaultInterval;
  }
  const sharedDetectorOptions = {
    writeDelayMs: 100,
    lastProcessedFieldName: "Last Processed"
  };

  const paymentRequestChanges = new ChangeDetector(paymentRequestsTable, {
    senstiveFields: sensitivePaymentRequestFields,
    ...sharedDetectorOptions
  });
  paymentRequestChanges.pollWithInterval(
    "airtable-sync.payment-requests",
    interval + 3000, // Stagger polling to avoid rate limit
    async recordsChanged => {
      console.info(`Found ${recordsChanged.length} changes in PaymentRequests`);
      const promises = [];
      recordsChanged.forEach(record => {
        if (
          record.didChange(paymentRequestFields.id) &&
          !record.getPrior(paymentRequestFields.id)
        ) {
          promises.push(newPaymentRequest(record));
        }
        if (record.didChange(paymentRequestFields.isPaid)) {
          promises.push(updateReimbursementMessage(record));
        }
      });
      return Promise.all(promises);
    }
  );

  const donorSignupChanges = new ChangeDetector(donorPaymentsTable, {
    senstiveFields: sensitiveDonorPaymentFields,
    ...sharedDetectorOptions
  });
  donorSignupChanges.pollWithInterval(
    "airtable-sync.donor-payments",
    interval,
    async recordsChanged => {
      console.info(`Found ${recordsChanged.length} changes in Donor Payments`);
      const promises = [];
      recordsChanged.forEach(record => {
        const isNewRecord =
          record.didChange(donorPaymentFields.id) &&
          !record.getPrior(donorPaymentFields.id);
        if (isNewRecord && !record.get(donorPaymentFields.donorSlackId)) {
          promises.push(newExternalDonorPayment(record));
        }
      });
      return Promise.all(promises);
    }
  );
}

module.exports = startWorker;
if (require.main === module) {
  startWorker(defaultInterval);
}
