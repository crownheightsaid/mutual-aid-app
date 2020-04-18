const ChangeDetector = require("airtable-change-detector");
const {
  table: requestsTable,
  SENSITIVE_FIELDS: sensitiveRequestFields
} = require("~airtable/tables/requests");
const updateMessageContent = require("./actions/updateMessageContent");

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

  const requestChanges = new ChangeDetector(requestsTable, {
    senstiveFields: sensitiveRequestFields,
    ...sharedDetectorOptions
  });
  requestChanges.pollWithInterval(
    "airtable-sync.requests",
    interval,
    async recordsChanged => {
      const statusFieldName = "Status";
      const codeFieldName = "Code";
      const slackIdFieldName = "Delivery slackid";
      const triggerBackfillFieldName = "Trigger Backfill";
      console.info(`Found ${recordsChanged.length} changes in Requests`);
      const promises = [];
      recordsChanged.forEach(record => {
        if (record.didChange(statusFieldName)) {
          const status = record.get(statusFieldName);
          const newStatus = record.getPrior(statusFieldName);
          console.log(
            `${record.get(codeFieldName)} moved from ${newStatus} -> ${status}`
          );
        }
        // TODO: Think about how to rate limit this to Airtable's 5 rps
        if (
          record.didChange(statusFieldName) ||
          record.didChange(slackIdFieldName)
        ) {
          promises.push(updateMessageContent(record));
        }
        if (record.didChange(triggerBackfillFieldName)) {
          promises.push(updateMessageContent(record));
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
