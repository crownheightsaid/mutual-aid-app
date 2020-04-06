const Airtable = require("airtable");
const { merge } = require("lodash");

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);

// ------- REQUEST TABLE ---------

exports.deleteRequest = async recordId => {
  console.log("Deleting record");
  try {
    const records = await base("Requests").destroy([recordId]);
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
    const record = await base("Requests").create({
      Message: request.message,
      Phone: request.phone || "",
      "Text or Voice?": request.source,
      "External Id": request.externalId || "",
      Status: "Dispatch Needed"
    });
    return [record, null];
  } catch (e) {
    console.error(`Couldn't create request: ${e}`);
    return [null, e];
  }
};

exports.findRequestByExternalId = async externalId => {
  try {
    const record = await base("Requests")
      .select({
        filterByFormula: `({External Id} = '${externalId}')`
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
  const requestOpenStates = ["Dispatch Started", "Delivery Needed"];
  const statusConstraints = requestOpenStates.map(s => `{Status} = '${s}'`);
  const formula = `OR(${statusConstraints.join(", ")})`;
  console.log(`Finding: ${formula}`);
  try {
    const requests = await base("Requests")
      .select({
        filterByFormula: formula
      })
      .all();
    const notInSlack = r => {
      const meta = JSON.parse(r.get("Meta"));
      return meta.slack_ts === undefined;
    };
    return [requests.filter(notInSlack), null];
  } catch (e) {
    return [[], `Error while looking up open requests: ${e}`];
  }
};

exports.findRequestByCode = async code => {
  try {
    const records = await base("Requests")
      .select({
        filterByFormula: `({Code} = '${code}')`
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
    const records = await base("Requests")
      .select({
        filterByFormula: `({Code} = '${code}')`
      })
      .firstPage();
    if (records.length === 0) {
      return [null, "No requests found with that code."];
    }
    if (update.Meta) {
      // Support for updating Meta as an object (rather than string)
      /* eslint no-param-reassign: ["error", { "props": false }] */
      const parsed = JSON.parse(records[0].get("Meta"));
      merge(parsed, update.Meta);
      update.Meta = JSON.stringify(parsed);
    }
    const record = records[0];
    const airUpdate = {
      id: record.id,
      fields: update
    };
    const updatedRecords = await base("Requests").update([airUpdate]);
    return [updatedRecords[0], null];
  } catch (e) {
    return [null, `Error while processing update: ${e}`];
  }
};

// ------ VOLUNTEER TABLE ---------

exports.findVolunteerByEmail = async email => {
  const record = await base("Volunteers")
    .select({
      filterByFormula: `({volunteer_email} = '${email}')`
    })
    .firstPage();
  return record ? record[0] : null;
};

exports.findVolunteerById = async id => {
  return base("Volunteers").find(id);
};

exports.airbase = base;
exports.UPDATE_BATCH_SIZE = 10;
