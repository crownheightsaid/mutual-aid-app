const { volunteersFields } = require("~airtable/tables/volunteers");

exports.APP_NAME = process.env.APP_NAME || "Crown Heights Mutual Aid";

// Slack channels
exports.ARTS_CHANNEL = "art_and_design";
exports.CARS_AND_BIKES_CHANNEL = "cars_and_bikes";
exports.DELIVERY_CHANNEL = "delivery_volunteers";
exports.FLYERS_CHANNEL = "flyer_squad";
exports.TECH_CHANNEL = "tech";

// Slack usergroups
exports.CARS_USERGROUP = "cars";
exports.BIKES_USERGROUP = "bikes";

const waysToHelp = volunteersFields.waysToHelp_options;
exports.VOLUNTEER_INTERESTS_TO_SLACK_CHANNELS = {
  [waysToHelp.artsDesignFilm]: [exports.ARTS_CHANNEL],
  [waysToHelp.bikeDelivery]: [
    exports.CARS_AND_BIKES_CHANNEL,
    exports.DELIVERY_CHANNEL
  ],
  [waysToHelp.carDelivery]: [
    exports.CARS_AND_BIKES_CHANNEL,
    exports.DELIVERY_CHANNEL
  ],
  [waysToHelp.onFootDelivery]: [exports.DELIVERY_CHANNEL],
  [waysToHelp.childCare]: [],
  [waysToHelp.financialSupport]: [],
  [waysToHelp.phoningNeighborsInNeed]: [],
  [waysToHelp.techAdminSupport]: [exports.TECH_CHANNEL],
  [waysToHelp.flyering]: [exports.FLYERS_CHANNEL],
  [waysToHelp.iHaveAPrinter]: [exports.FLYERS_CHANNEL]
};

exports.VOLUNTEER_INTERESTS_TO_USERGROUPS = {
  [waysToHelp.artsDesignFilm]: [],
  [waysToHelp.bikeDelivery]: [exports.BIKES_USERGROUP],
  [waysToHelp.carDelivery]: [exports.CARS_USERGROUP],
  [waysToHelp.onFootDelivery]: [],
  [waysToHelp.childCare]: [],
  [waysToHelp.financialSupport]: [],
  [waysToHelp.phoningNeighborsInNeed]: [],
  [waysToHelp.techAdminSupport]: [],
  [waysToHelp.flyering]: [],
  [waysToHelp.iHaveAPrinter]: []
};
