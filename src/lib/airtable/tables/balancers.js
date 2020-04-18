const { paymentsAirbase } = require("~airtable/bases");

exports.findBalancer = async paymentMethod => {
  try {
    const record = await balancersTable
      .select({
        // hate these hard-codes, consider getting from a static reference elsewhere or something
        filterByFormula: `And({${paymentMethod}ID} != null, {Deactivated}!=TRUE())`,
        sort: [{ field: "TotalOutstanding", direction: "asc" }]
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

// ==================================================================
// Schema
// ==================================================================

const balancersTableName = (exports.tableName = "Balancers");
const balancersTable = (exports.table = paymentsAirbase(balancersTableName));
