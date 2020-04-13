const Airtable = require("airtable");
const { merge } = require("lodash");

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

exports.findOpenRequests = async () => {
  const requestOpenStates = ["Dispatch Started", "Delivery Needed"];
  const statusConstraints = requestOpenStates.map(s => `{Status} = '${s}'`);
  const formula = `OR(${statusConstraints.join(", ")})`;
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
      return [null, `No requests found with code: ${code}`];
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


// ------ PAYMENT REQUESTS TABLE ---------

exports.findReimbursablePaymentRequests = async => {
  try {
    const records = await base("PaymentRequests")
      .select({
        filterByFormula: `And({Approval} = 'Approved', {Paid}=0`,
        sort: [{field: "Created", direction: "asc"}]
      })
      .firstPage();
    return records
      ? [records, null]
      : [null, "No pending payment requests"];
  } catch (e) {
    console.error(`Error while fetching reimbursable payment requests ${e}`); // TODO cargo culted from above, what is this rescuing?
    return [null, e.message];
  }
};


// ------ BALANCER TABLE ---------

exports.findBalancer = async (paymentMethod) => {
  try {
    const record = await base("Balancers")
      .select({
        // hate these hard-codes, consider getting from a static reference elsewhere or something
        filterByFormula: `And({${paymentMethod} ID} != null, {Deactivated}!=TRUE())`,
        sort: [{field: "Total Outstanding", direction: "asc"}]
      })
      .firstPage();
    return record
      ? [record[0], null]
      : [null, "No balancers available for this payment method."];
  } catch (e) {
    console.error(`Error while fetching balancers: ${e}`); // TODO cargo culted from above, what is this rescuing?
    return [null, e.message];
  }
};


// ------ DONORPAYMENTS TABLE ---------

exports.createDonorPayment = async request => {
  console.log("creating donor payments record");
  try {
    const record = await base("DonorPayments").create({
      "Donor": ,
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

exports.findDonorPaymentByCode = async (code) => {
  try {
    const record = await base("DonorPayments")
      .select({
        // hate these hard-codes, consider getting from a static reference elsewhere or something
        filterByFormula: `And({Code} = '${code}', {Status}!="Completed", {Status}!="FailedNoAnswer", {Status}!="FailedDonorBackedOut")`
      })
      .firstPage();
    return record
      ? [record[0], null]
      : [null, "Valid payment with that code not found"];
  } catch (e) {
    console.error(`Error while fetching request by code ${code}: ${e}`); // TODO cargo culted from above, what is this intended to rescue?
    return [null, e.message];
  }
};




exports.airbase = base;
exports.UPDATE_BATCH_SIZE = 10;
exports.SENSITIVE_FIELDS = [
  "Phone",
  "Email Address",
  "Message",
  "Intake General Notes"
];
