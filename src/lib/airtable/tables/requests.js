const { merge } = require("lodash");
const { base } = require("~airtable/bases");

const fields = (exports.fields = {
  phone: {
    name: "Phone"
  },
  code: {
    name: "Code"
  },
  time: {
    name: "Time"
  },
  type: {
    name: "Text or Voice?"
  },
  email: {
    name: "Email Address"
  },
  neighborhood: {
    name: "Neighborhood MA-NYC"
  },
  message: {
    name: "Message"
  },
  status: {
    name: "Status",
    dispatchNeeded: "Dispatch Needed",
    dispatchStarted: "Dispatch Started",
    deliveryNeeded: "Delivery Needed",
    deliveryAssigned: "Delivery Assigned",
    requestComplete: "Request Complete",
    noAnswer: "No Answer (call back)",
    duplicate: "Duplicate",
    beyondCrownHeights: "Beyond Crown Heights",
    followup: "Other Followup",
    anotherGroup: "Sent to Another Group",
    needsPosting: "Needs Posting!",
    brownsville: "Brownsville/East NY"
  },
  intakeVolunteer: {
    name: "Intake volunteer"
  },
  firstName: {
    name: "First Name"
  },
  crossStreetFirst: {
    name: "Cross Street #1"
  },
  crossStreetSecond: {
    name: "Cross Street #2"
  },
  neighborhoodArea: {
    name: "Neighborhood Area (See Map)"
  },
  timeSensitivity: {
    name: "Time Sensitivity"
  },
  typeOfSupport: {
    name: "What type(s) of support are you seeking?"
  },
  deliveryVolunteer: {
    name: "Delivery volunteer"
  },
  deliverySlackId: {
    name: "Delivery slackId"
  },
  externalId: {
    name: "External Id"
  },
  lastModified: {
    name: "Last Modified"
  },
  lastProcessed: {
    name: "Last Processed"
  },
  meta: {
    name: "Meta"
  },
  triggerBackfill: {
    name: "Trigger Backfill"
  }
});
const tableName = (exports.tableName = "Requests");
const table = (exports.table = base(tableName));

exports.deleteRequest = async recordId => {
  console.log("Deleting record");
  try {
    const records = await table.destroy([recordId]);
    return [records[0], null];
  } catch (e) {
    console.error(`Couldn't delete request: ${e}`);
    return [null, e];
  }
};

exports.createRequest = async request => {
  // TODO: add asserts for non-|| fields below
  console.log("creating record");
  try {
    const record = await table.create({
      [fields.message]: request.message,
      [fields.phone]: request.phone || "",
      [fields.type]: request.source,
      [fields.externalId]: request.externalId || "",
      [fields.crossStreetFirst]: request.crossStreets || "",
      [fields.email]: request.email || "",
      [fields.timeSensitivity]: request.urgency || "",
      [fields.status]: fields.status.dispatchNeeded
    });
    return [record, null];
  } catch (e) {
    console.error(`Couldn't create request: ${e}`);
    return [null, e];
  }
};

exports.findRequestByExternalId = async externalId => {
  try {
    const record = await table
      .select({
        filterByFormula: `({${fields.externalId}} = '${externalId}')`
      })
      .firstPage();
    return record
      ? [record[0], null]
      : [null, "Request with that external ID not found"];
  } catch (e) {
    console.error(`Error while fetching request by eID: ${e}`);
    return [null, e];
  }
};

exports.findOpenRequests = async () => {
  const requestOpenStates = [
    fields.status.dispatchStarted,
    fields.status.deliveryNeeded
  ];
  const statusConstraints = requestOpenStates.map(
    s => `{${fields.status}} = '${s}'`
  );
  const formula = `OR(${statusConstraints.join(", ")})`;
  try {
    const requests = await table
      .select({
        filterByFormula: formula
      })
      .all();
    const notInSlack = r => {
      const meta = r.get(fields.meta);
      let parsed = {};
      try {
        parsed = JSON.parse(meta);
      } catch {
        console.log("Invalid meta %s: %O", r.get(fields.code), meta);
      }
      return parsed.slack_ts === undefined;
    };
    return [requests.filter(notInSlack), null];
  } catch (e) {
    return [[], `Error while looking up open requests: ${e}`];
  }
};

exports.findRequestByCode = async code => {
  try {
    const records = await table
      .select({
        filterByFormula: `({${fields.code}} = '${code}')`
      })
      .firstPage();
    if (records.length === 0) {
      return [null, "No requests found with that code."];
    }
    const record = records[0];
    return [record, null];
  } catch (e) {
    return [null, `Error while finding request: ${e}`];
  }
};

// `update` should look like:
// {
//   "Some Requests Field": "New Value",
//   "Another field": "Another New Value"
//   "Meta": {key: "value"}
// }
exports.updateRequestByCode = async (code, update) => {
  try {
    const records = await table
      .select({
        filterByFormula: `({${fields.code}} = '${code}')`
      })
      .firstPage();
    if (records.length === 0) {
      return [null, `No requests found with code: ${code}`];
    }
    if (update[fields.meta]) {
      // Support for updating Meta as an object (rather than string)
      /* eslint no-param-reassign: ["error", { "props": false }] */
      const parsed = JSON.parse(records[0].get(fields.meta));
      merge(parsed, update[fields.meta]);
      update[fields.meta] = JSON.stringify(parsed);
    }
    const record = records[0];
    const airUpdate = {
      id: record.id,
      fields: update
    };
    const updatedRecords = await table.update([airUpdate]);
    return [updatedRecords[0], null];
  } catch (e) {
    return [null, `Error while processing update: ${e}`];
  }
};
