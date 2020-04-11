const ChangeDetector = require("airtable-change-detector");
const updateMessageContent = require("./actions/updateMessageContent");
const { SENSITIVE_FIELDS, airbase } = require("../../airtable");

const defaultInterval = 5000;

function startWorker(interval) {
  let pollInterval = interval;
  if (pollInterval < defaultInterval) {
    console.log(
      `Interval ${pollInterval} is too low. Clamping to ${defaultInterval}`
    );
    pollInterval = defaultInterval;
  }
  const requestChanges = new ChangeDetector(airbase("Requests"), {
    writeDelayMs: 100,
    lastProcessedFieldName: "Last Processed",
    sensitiveFields: SENSITIVE_FIELDS
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
        // TODO: use this a few more times from different contexts and think about refactoring the api
        if (record.didChange(statusFieldName)) {
          const status = record.get(statusFieldName);
          const newStatus = record.getPrior(statusFieldName);
          console.log(
            `${record.get(codeFieldName)} moved from ${newStatus} -> ${status}`
          );
        }
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
