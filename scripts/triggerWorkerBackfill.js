// Triggers a airtable backfill by modifying a watched field for every record
// https://github.com/crownheightsaid/mutual-aid-app/pull/35
const _ = require("lodash");
const { wait } = require("./utils");
const { airbase, UPDATE_BATCH_SIZE } = require("../src/airtable");

/* eslint-disable no-await-in-loop, no-loop-func */
(async () => {
  const allResults = await airbase("Requests")
    .select({
      fields: ["Trigger Backfill", "Code"]
    })
    .all();
  const updates = [];
  allResults.forEach(r => {
    const triggerCounter = r.get("Trigger Backfill") || 0;
    updates.push({
      id: r.id,
      fields: { "Trigger Backfill": triggerCounter + 1 }
    });
  });
  console.log(updates);
  // unfortunately Airtable only allows 10 records at a time to be updated so batck up the changes
  for (const batch of _.chunk(updates, UPDATE_BATCH_SIZE)) {
    await wait(100);
    const updatedResults = await airbase("Requests").update(batch);
    console.log(`Updated: ${updatedResults.length}`);
  }
})();
