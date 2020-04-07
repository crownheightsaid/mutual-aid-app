const ChangeDetector = require("./ChangeDetector");
const updateMessageContent = require("./actions/updateMessageContent");

const wait = interval => new Promise(r => setTimeout(r, interval));
const defaultInterval = 5000;
/**
 * Reusable scheduler for repeating in-process tasks
 * `interval` is between one invocation's end and the next one's start, unlike `setInterval`
 */
function schedule(taskName, interval, f) {
  let running = true;
  (async () => {
    console.log(`Starting ${taskName} and polling every ${interval}ms`);
    while (running) {
      /* eslint-disable */
      try {
        await f();
      } catch (e) {
        console.error(
          `Error in ${taskName} poll. Continuing in ${interval}. %O`,
          e
        );
      }
      await wait(interval);
    }
    console.log(`Stopped ${taskName}`);
  })();
  return () => {
    console.log(`Stopping ${taskName}`);
    running = false;
  };
}

function startWorker(interval) {
  if (interval < defaultInterval) {
    console.log(
      `Interval ${interval} is too low. Clamping to ${defaultInterval}`
    );
    interval = defaultInterval;
  }
  let requestChanges = new ChangeDetector("Requests");
  schedule("airtable-sync.requests", interval, async () => {
    const recordsChanged = await requestChanges.poll();
    const statusFieldName = "Status";
    const codeFieldName = "Code";
    const slackIdFieldName = "Delivery slackid";
    console.info(`Found ${recordsChanged.length} changes in Requests`);
    for (const record of recordsChanged) {
      //TODO: use this a few more times from different contexts and think about refactoring the api
      if (record.didChange(statusFieldName)) {
        const status = record.get(statusFieldName);
        const newStatus = record.getPrior(statusFieldName);
        console.log(
          `${record.get(codeFieldName)} moved from ${newStatus} -> ${status}`
        );
      }
      if(record.didChange(statusFieldName) || record.didChange(slackIdFieldName)){
        // await updateMessageContent(record)
      }

    }
  });
}

module.exports = startWorker;
if (require.main === module) {
  startWorker(defaultInterval);
}
