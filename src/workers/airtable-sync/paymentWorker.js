const ChangeDetector = require("airtable-change-detector");
const {
  table: donorsTable,
  fields: donorFields,
  SENSITIVE_FIELDS: sensitiveDonorFields
} = require("~airtable/tables/donors");
const {
  table: paymentRequestsTable,
  fields: paymentRequestFields,
  SENSITIVE_FIELDS: sensitivePaymentRequestFields
} = require("~airtable/tables/paymentRequests");
const newDonor = require("./actions/payments/newDonor");
const newPaymentRequest = require("./actions/payments/newPaymentRequest");

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
    interval,
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
      });
      return Promise.all(promises);
    }
  );

  const donorSignupChanges = new ChangeDetector(donorsTable, {
    senstiveFields: sensitiveDonorFields,
    ...sharedDetectorOptions
  });
  donorSignupChanges.pollWithInterval(
    "airtable-sync.donors",
    interval,
    async recordsChanged => {
      console.info(`Found ${recordsChanged.length} changes in Donors`);
      const promises = [];
      recordsChanged.forEach(record => {
        if (
          record.didChange(donorFields.id) &&
          !record.getPrior(donorFields.id)
        ) {
          promises.push(newDonor(record));
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
