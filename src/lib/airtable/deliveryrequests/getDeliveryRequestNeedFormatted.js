/**
 * This helper function is shared to synthesize the
 * need / service type for delivery requests.
 */

const { fields } = require("~airtable/tables/requestsSchema");

exports.getDeliveryRequestNeedFormatted = (services) => {
  if (services === undefined) {
    return "Not stated";
  }
  const servicesString = services.join(", ");
  if (servicesString === fields.supportType_options.delivery) {
    return "Groceries / Shopping";
  }
  return servicesString;
};
