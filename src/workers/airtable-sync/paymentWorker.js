const ChangeDetector = require("airtable-change-detector");
const {
  donorPaymentsTable,
  donorPaymentsFields,
<<<<<<< HEAD
  donorPaymentsSensitiveFields
} = require("~airtable/tables/donorPayments");
const {
  paymentRequestsTable,
  paymentRequestsFields,
  paymentRequestsSensitiveFields
} = require("~airtable/tables/paymentRequests");
=======
  donorPaymentsSensitiveFields,
} = require("~airtable/tables/donorPaymentsSchema");
const {
  paymentRequestsTable,
  paymentRequestsFields,
  paymentRequestsSensitiveFields,
} = require("~airtable/tables/paymentRequestsSchema");
>>>>>>> upstream/master
const sendErrorNotification = require("~slack/errorNotification");
const newExternalDonorPayment = require("./actions/payments/newExternalDonorPayment");
const newPaymentRequest = require("./actions/payments/newPaymentRequest");
const updateReimbursementMessage = require("./actions/payments/updateReimbursementStatus");

const defaultInterval = 10000;

const errFunc = async (error) => {
  sendErrorNotification(error);
};

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
    senstiveFields: paymentRequestsSensitiveFields,
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
          record.didChange(paymentRequestsFields.id) &&
          !record.getPrior(paymentRequestsFields.id)
        ) {
          promises.push(newPaymentRequest(record));
        }
        if (record.didChange(paymentRequestsFields.isPaid)) {
          promises.push(updateReimbursementMessage(record));
        }
      });
      return Promise.all(promises);
    },
    errFunc
  );

  const donorSignupChanges = new ChangeDetector(donorPaymentsTable, {
    senstiveFields: donorPaymentsSensitiveFields,
    ...sharedDetectorOptions
  });
  donorSignupChanges.pollWithInterval(
    "airtable-sync.donor-payments",
    interval,
    async recordsChanged => {
      console.info(`Found ${recordsChanged.length} changes in Donor Payments`);
      const promises = [];
      recordsChanged.forEach(record => {
        const isExternal = !record.get(donorPaymentsFields.donorSlackId);
        if (isExternal) {
          // this logic is needed because the donorPayment isn't created at once
          const hasAmountAndRequest =
            record.get(donorPaymentsFields.amount) &&
            record.get(donorPaymentsFields.paymentRequest);
          const isNewAmount =
            record.didChange(donorPaymentsFields.amount) &&
            !record.getPrior(donorPaymentsFields.amount);
          const isNewPaymentRequest =
            record.didChange(donorPaymentsFields.paymentRequest) &&
            !record.getPrior(donorPaymentsFields.paymentRequest);
          if (hasAmountAndRequest && (isNewAmount || isNewPaymentRequest)) {
            promises.push(newExternalDonorPayment(record));
          }
        }
      });
      return Promise.all(promises);
    },
    errFunc
  );
}

module.exports = startWorker;
if (require.main === module) {
  startWorker(defaultInterval);
}
