const { volunteersFields } = require("~airtable/tables/volunteers");
const { str } = require("~strings/i18nextWrappers");

exports.APP_NAME =
  process.env.APP_NAME || str("common:appName", "Crown Heights Mutual Aid");

// Slack channels
exports.ADMIN_CHANNEL = str("slackapp:channels.admin", "admin");
exports.ARTS_CHANNEL = str("slackapp:channels.artAndDesign", "art_and_design");
exports.CARS_AND_BIKES_CHANNEL = str(
  "slackapp:channels.carsAndBikes",
  "cars_and_bikes"
);
exports.REQUESTS_CHANNEL = str(
  "slackapp:channels.communityRequests",
  "community_needs"
);
exports.INTAKE_CHANNEL = str(
  "slackapp:channels.intakeVolunteers",
  "intake_volunteers"
);
exports.DELIVERY_CHANNEL = str(
  "slackapp:channels.deliveryVolunteers",
  "delivery_volunteers"
);
exports.FLYERS_CHANNEL = str("slackapp:channels.flyering", "flyer_squad");
exports.TECH_CHANNEL = str("slackapp:channels.tech", "tech");

// Slack usergroups
exports.CARS_USERGROUP = str("slackapp:usergroups.cars", "cars");
exports.BIKES_USERGROUP = str("slackapp:usergroups.bikes", "bikes");

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
