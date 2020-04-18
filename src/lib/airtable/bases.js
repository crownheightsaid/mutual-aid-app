const Airtable = require("airtable");

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_KEY });

exports.paymentsAirbase = process.env.AIRTABLE_PAYMENTS_BASE
  ? airtable.base(process.env.AIRTABLE_PAYMENTS_BASE)
  : () => {
      console.debug("Payments Airbase not registered.");
    };
exports.airbase = process.env.AIRTABLE_BASE
  ? airtable.base(process.env.AIRTABLE_BASE)
  : null;
