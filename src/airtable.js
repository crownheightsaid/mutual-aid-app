const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);

// ==================================================================
// Request Table
// ==================================================================

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
      "Cross Street #1": request.crossStreets || "",
      "Email Address": request.email || "",
      "Time Sensitivity": request.urgency || "",
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

// ==================================================================
// Volunteer Table
// ==================================================================

exports.findVolunteerByEmail = async email => {
  try {
    const records = await base("Volunteers")
      .select({
        filterByFormula: `({volunteer_email} = '${email}')`
      })
      .firstPage();
    if (!records || records.length === 0) {
      return [null, `No volunteer signed up with email ${email}`];
    }
    return [records[0], null];
  } catch (e) {
    return [null, `Errors looking up volunteer by email ${email}: ${e}`];
  }
};

exports.findVolunteerById = async id => {
  try {
    return [base("Volunteers").find(id), null];
  } catch (e) {
    return [null, `Errors looking up volunteer by recordId ${id}: ${e}`];
  }
};

exports.airbase = base;
exports.UPDATE_BATCH_SIZE = 10;
