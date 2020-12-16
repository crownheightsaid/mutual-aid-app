/**
 * This helper function is shared to synthesize the
 * need / service type for delivery requests.
 */

const { fields } = require("~airtable/tables/requestsSchema");

exports.getDeliveryRequestNeedFormatted = (services) => {
  if (!services) {
    return "Not stated";
  }

  let servicesString = "";

  if (typeof services === "string") {
    servicesString = services;
  } else if (Array.isArray(services)) {
    servicesString = services.join(", ");
  }

  if (servicesString === fields.supportType_options.delivery) {
    return "Groceries / Shopping";
  }
  return servicesString;
};
