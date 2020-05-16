const Airtable = require("airtable");

const airtable = process.env.AIRTABLE_KEY
  ? new Airtable({ apiKey: process.env.AIRTABLE_KEY })
  : null;

exports.paymentsAirbase =
  airtable && process.env.AIRTABLE_PAYMENTS_BASE
    ? airtable.base(process.env.AIRTABLE_PAYMENTS_BASE)
    : () => {
        console.debug("Payments Airbase not registered.");
      };
exports.airbase =
  airtable && process.env.AIRTABLE_BASE
    ? airtable.base(process.env.AIRTABLE_BASE)
    : () => {
        console.debug("Main Airbase not registered.");
      };
