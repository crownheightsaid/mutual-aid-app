const { merge } = require("lodash");
const { airbase } = require("~airtable/bases");

exports.deleteRequest = async recordId => {
  console.log("Deleting record");
  try {
    const records = await requestsTable.destroy([recordId]);
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
    const record = await requestsTable.create({
      [fields.message]: request.message,
      [fields.phone]: request.phone || "",
      [fields.type]: request.source,
      [fields.externalId]: request.externalId || "",
      [fields.crossStreetFirst]: request.crossStreets || "",
      [fields.email]: request.email || "",
      [fields.timeSensitivity]: request.urgency || "",
      [fields.status]: request.status || fields.status_options.dispatchNeeded
    });
    return [record, null];
  } catch (e) {
    console.error(`Couldn't create request: ${e}`);
    return [null, e];
  }
};

exports.findRequestByExternalId = async externalId => {
  try {
    const record = await requestsTable
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

// Returns requests that are to be posted in a public requests channel
exports.findOpenRequestsForSlack = async () => {
  const requestOpenStates = [
    fields.status_options.dispatchStarted,
    fields.status_options.deliveryNeeded
  ];
  const statusConstraints = requestOpenStates.map(
    s => `{${fields.status}} = '${s}'`
  );
  const formula = `OR(${statusConstraints.join(", ")})`;
  try {
    const requests = await requestsTable
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
    // Delivery cluster requests are handled separately
    const notForDrivingCluster = r => {
      const forDrivingCluster = r.get(fields.forDrivingClusters);
      return !forDrivingCluster;
    };

    return [requests.filter(notInSlack).filter(notForDrivingCluster), null];
  } catch (e) {
    return [[], `Error while looking up open requests: ${e}`];
  }
};

exports.findRequestByCode = async code => {
  try {
    const records = await requestsTable
      .select({
        filterByFormula: `(FIND('${code}', {${fields.code}}) > 0)`
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

exports.findRequestByPhone = async phone => {
  try {
    const records = await requestsTable
      .select({
        maxRecords: 1,
        fields: [fields.phone],
        filterByFormula: `({${fields.phone}} = '${phone}')`
      })
      .firstPage();
    if (records && records.length === 0) {
      return [null, "No existing request with that phone"];
    }
    return [records[0], null];
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
    const records = await requestsTable
      .select({
        filterByFormula: `(FIND('${code}', {${fields.code}}) > 0)`
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
    const updatedRecords = await requestsTable.update([airUpdate]);
    return [updatedRecords[0], null];
  } catch (e) {
    return [null, `Error while processing update: ${e}`];
  }
};

// ==================================================================
// Schema
// ==================================================================

const requestsTableName = (exports.tableName = "Requests");
const requestsTable = (exports.table = airbase(requestsTableName));
const fields = (exports.fields = {
  phone: "Phone",
  time: "Time",
  type: "Text or Voice?",
  type_options: {
    text: "text",
    voice: "voice",
    manyc: "manyc",
    email: "email"
  },
  message: "Message",
  crossStreetFirst: "Cross Street #1",
  crossStreetSecond: "Cross Street #2",
  email: "Email Address",
  neighborhoodAreaSeeMap: "Neighborhood Area (See Map)",
  neighborhoodAreaSeeMap_options: {
    ne: "NE",
    nw: "NW",
    se: "SE",
    sw: "SW",
    notCrownHeights: "Other - not Crown Heights"
  },
  languages: "Languages",
  languages_options: {
    spanish: "Spanish",
    chineseMandarin: "Chinese - Mandarin",
    chineseCantonese: "Chinese - Cantonese",
    haitianKreyol: "Haitian Kreyol",
    russian: "Russian",
    bengali: "Bengali",
    french: "French",
    yiddish: "Yiddish",
    italian: "Italian",
    korean: "Korean",
    arabic: "Arabic",
    tagalog: "Tagalog",
    polish: "Polish",
    asl: "ASL",
    english: "English",
    eglish: "eglish"
  },
  supportType: "What type(s) of support are you seeking?",
  supportType_options: {
    delivery: "Deliver groceries or supplies to me",
    prescriptionPickUp: "Pick up a prescription for me",
    "1On1CheckInsPhoneCallZoomEtcToTouchBaseWithANeighbor":
      "1 on 1 check-ins (phone call, Zoom, etc to touch base with a neighbor)",
    financialSupport: "Financial support",
    translation:
      "Translation and interpretation into a language other than English",
    socialServices:
      "Social Services guidance (filing for medicare, unemployment, etc)",
    other: "Other (please describe below)"
  },
  financialSupportNeeded: "Financial Support Needed?",
  financialSupportNeeded_options: {
    yes: "yes - need donation",
    no: "no donation need"
  },
  intakeVolunteer: "Intake volunteer",
  deliveryVolunteer: "Delivery volunteer",
  timeSensitivity: "Time Sensitivity",
  intakeNotes: "Intake General Notes",
  startEditingHere: "Start Editing Here!",
  receipts: "Receipts",
  code: "Code",
  status: "Status",
  status_options: {
    dispatchNeeded: "Dispatch Needed",
    dispatchStarted: "Dispatch Started",
    noAnswer: "No Answer (call back)",
    deliveryNeeded: "Delivery Needed",
    duplicate: "Duplicate",
    deliveryAssigned: "Delivery Assigned",
    requestComplete: "Request Complete",
    beyondCrownHeights: "Beyond Crown Heights",
    otherFollowup: "Other Followup",
    sentToAnotherGroup: "Sent to Another Group",
    needsPosting: "Needs Posting!",
    brownsville: "Brownsville/East NY"
  },
  externalId: "External Id",
  deliverySlackId: "Delivery slackId",
  lastModified: "Last Modified",
  meta: "Meta",
  lastProcessed: "Last Processed",
  firstName: "First Name",
  triggerBackfill: "Trigger Backfill",
  neighborhood: "Neighborhood MA-NYC",
  forDrivingClusters: "For Driving Clusters"
});
exports.SENSITIVE_FIELDS = [
  fields.phone,
  fields.email,
  fields.message,
  fields.intakeNotes
];
