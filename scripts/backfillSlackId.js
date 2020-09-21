const _ = require("lodash");
const slackapi = require("~slack/webApi");
const { airbase } = require("~airtable/bases");
const { UPDATE_BATCH_SIZE } = require("~airtable/constants");
const { wait } = require("./utils");

/* eslint-disable no-await-in-loop, no-loop-func */

(async () => {
  const updates = [];
  const records = await airbase("Volunteers")
    .select({
      filterByFormula: "({volunteer_slack_id} = '')",
    })
    .firstPage();

  for (const record of records) {
    console.log("Retrieved", record.id);
    try {
      const result = await slackapi.users.lookupByEmail({
        email: record.get("volunteer_email").toLowerCase(),
      });
      const slackId = result.user.id;
      console.log(`adding slack id: ${slackId}`);
      await wait(2000);
      updates.push({
        id: record.id,
        fields: {
          volunteer_slack_id: slackId,
        },
      });
    } catch (e) {
      console.log(`Error looking up user: ${e}`);
      await wait(300);
    }
  }

  let updated = 0;
  console.log(updates);
  for (const batch of _.chunk(updates, UPDATE_BATCH_SIZE)) {
    console.log("Batch");
    await wait(1000);
    airbase("Volunteers").update(batch, (err, updatedRecords) => {
      if (err) {
        console.error(`Error updating record: ${err}`);
      }
      updatedRecords.forEach((record) => {
        console.log(`Updated ${updated}: ${record.get("volunteer_email")}`);
        updated += 1;
      });
    });
  }
})();
