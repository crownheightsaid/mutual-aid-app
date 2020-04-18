const Airtable = require("airtable");

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_KEY });

exports.paymentsAirbase = airtable.base(process.env.AIRTABLE_PAYMENTS_BASE);
exports.airbase = airtable.base(process.env.AIRTABLE_BASE);
