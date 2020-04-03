const Airtable = require("airtable");
const assert = require("assert").strict;

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);

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

// ------- REQUEST TABLE ---------

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

exports.airbase = base;
exports.UPDATE_BATCH_SIZE = 10;
