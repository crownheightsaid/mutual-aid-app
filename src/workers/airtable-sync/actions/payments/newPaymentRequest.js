const slackapi = require("~slack/webApi");
const {
  fields: paymentRequestFields
} = require("~airtable/tables/paymentRequests");

module.exports = async record => {
  console.debug(
    `New Payment Request: ${record.get("ID")}  |  ${record.get(
      "FirstName"
    )}  |  ${record.get("Amount")}  |  ${record.get("Created")}`
  );

  // TODO
  // Send slack notification to kanban board for approving payment requests
};
