const { isEqual } = require("lodash");

/**
 * This helper function is shared to synthesize the
 * need / service type for delivery requests.
 */

const getDeliveryRequestNeedFormatted = (services, requestsFields) => {
  const servicesString = services.join(", ");
  if (isEqual(servicesString, [requestsFields.supportType_options.delivery])) {
      // eslint-disable-line
    return "Groceries / Shopping";
  }
  return servicesString;
};

export default getDeliveryRequestNeedFormatted;
