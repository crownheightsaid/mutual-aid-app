const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);

exports.findVolunteerByEmail = async email => {
  const record = await base("Volunteers")
    .select({
      filterByFormula: `({volunteer_email} = '${email}')`
    })
    .firstPage();
  return record ? record[0] : null;
};

/**
 * Saves a request ao Airtable. WARNING: only handles some fields at the moment
 */
exports.saveRequest = async (emailAddress, message) => {
  const request = {
    "Email Address": emailAddress,
    Message: message,
    "Text or Voice?": "text"
  };
  const record = await base("Requests").create(request);
  return record;
};

exports.airbase = base;
