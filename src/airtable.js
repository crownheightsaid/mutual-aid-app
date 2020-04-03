const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);

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
