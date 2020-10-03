const ChangeDetector = require("airtable-change-detector");
const {
  table: requestsTable,
  fields: requestFields,
  SENSITIVE_FIELDS: sensitiveRequestFields,
} = require("~airtable/tables/requestsSchema");
const sendErrorNotification = require("~slack/errorNotification");
const updateMessageContent = require("./actions/updateMessageContent");
const notifyManyc = require("./actions/notifyManyc");

const defaultInterval = 10000;

const errFunc = async (error) => {
  await sendErrorNotification(error);
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
    lastProcessedFieldName: "Last Processed",
  };

  const requestChanges = new ChangeDetector(requestsTable, {
    senstiveFields: sensitiveRequestFields,
    ...sharedDetectorOptions,
  });
  requestChanges.pollWithInterval(
    "airtable-sync.requests",
    interval,
    async (recordsChanged) => {
      console.info(`Found ${recordsChanged.length} changes in Requests`);
      const promises = [];
      recordsChanged.forEach((record) => {
        if (record.didChange(requestFields.status)) {
          const status = record.get(requestFields.status);
          const newStatus = record.getPrior(requestFields.status);
          console.log(
            `${record.get(
              requestFields.code
            )} moved from ${newStatus} -> ${status}`
          );
        }
        // TODO: Think about how to rate limit this to Airtable's 5 rps
        if (
          record.didChange(requestFields.status) ||
          record.didChange(requestFields.deliverySlackId) ||
          record.didChange(requestFields.triggerBackfill)
        ) {
          promises.push(updateMessageContent(record));
        }
        if (
          record.get(requestFields.type) === requestFields.type_options.manyc
        ) {
          promises.push(notifyManyc(record));
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
