const { donorPaymentsTable, fields } = require("./donorPaymentsSchema");

// Expects mapping of fields
exports.createDonorPayment = async (donorPaymentFields) => {
  console.debug("creating donor payments record");
  try {
    const record = await donorPaymentsTable.create([
      { fields: donorPaymentFields },
    ]);
    return [record, null];
  } catch (e) {
    console.error(`Couldn't create request: ${e}`);
    return [null, e];
  }
};

exports.findDonorPaymentByCode = async (code) => {
  try {
    const andConditions = [
      `{${fields.code}} = "${code}"`,
      `{${fields.status}} != "${fields.status_options.completed}"`,
      `{${fields.status}} != "${fields.status_options.failedNoAnswer}"`,
      `{${fields.status}} != "${fields.status_options.failedDonorBackedOut}"`,
    ];
    const record = await donorPaymentsTable
      .select({
        filterByFormula: `And(${andConditions.join(",")})`,
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
