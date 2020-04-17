const Airtable = require("airtable");
const { merge } = require("lodash");

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);

// ==================================================================
// Request Table
// ==================================================================

// ==================================================================
// Volunteer Table
// ==================================================================

exports.findVolunteerByEmail = async email => {
  try {
    const records = await base("Volunteers")
      .select({
        filterByFormula: `(LOWER({volunteer_email}) = '${email.toLowerCase()}')`
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
    return [await base("Volunteers").find(id), null];
  } catch (e) {
    return [null, `Errors looking up volunteer by recordId ${id}: ${e}`];
  }
};

exports.airbase = base;
exports.SENSITIVE_FIELDS = [
  "Phone",
  "Email Address",
  "Message",
  "Intake General Notes"
];
