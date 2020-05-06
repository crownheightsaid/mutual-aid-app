const { paymentsAirbase } = require("~airtable/bases");

exports.findDonorById = async id => {
  if (!id) {
    return [null, "No id provided for findDonorById"];
  }
  try {
    return [await donorsTable.find(id), null];
  } catch (e) {
    return [null, `Errors looking up donor by recordId ${id}: ${e}`];
  }
};

// ==================================================================
// Schema
// ==================================================================

const donorsTableName = (exports.donorsTableName = "Donors");
const donorsTable = (exports.donorsTable = paymentsAirbase(donorsTableName));
const fields = (exports.donorsFields = {
  id: "ID",
  paymentMethods: "PaymentMethods",
  paymentMethods_options: {
    venmo: "Venmo",
    paypal: "Paypal",
    cashApp: "CashApp"
  },
  phone: "Phone",
  firstName: "FirstName",
  message: "Message",
  donorPayments: "DonorPayments",
  amount: "Amount",
  lastModified: "Last Modified",
  created: "Created",
  meta: "Meta",
  lastProcessed: "Last Processed"
});
exports.sensitiveFields = [fields.phone];
