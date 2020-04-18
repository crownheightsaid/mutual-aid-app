const { paymentsAirbase } = require("~airtable/bases");

// ==================================================================
// Schema
// ==================================================================

const donorsTableName = (exports.tableName = "Donors");
const donorsTable = (exports.table = paymentsAirbase(donorsTableName));
const fields = (exports.fields = {
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
