const { volunteersFields } = require("~airtable/tables/volunteersSchema");
const { str } = require("~strings/i18nextWrappers");

exports.APP_NAME = process.env.APP_NAME || str("common:appName");

// Slack channels
exports.ADMIN_CHANNEL = str("slackapp:channels.admin");
exports.ARTS_CHANNEL = str("slackapp:channels.artAndDesign");
exports.CARS_AND_BIKES_CHANNEL = str("slackapp:channels.carsAndBikes");
exports.REQUESTS_CHANNEL = str("slackapp:channels.communityRequests");
exports.REIMBURSEMENT_CHANNEL = str(
  "slackapp:channels.communityReimbursements",
  "community_reimbursement"
);
exports.INTAKE_CHANNEL = str("slackapp:channels.intakeVolunteers");
exports.DELIVERY_CHANNEL = str("slackapp:channels.deliveryVolunteers");
exports.FLYERS_CHANNEL = str("slackapp:channels.flyering");
exports.TECH_CHANNEL = str("slackapp:channels.tech");
exports.HAT_CHANNEL = str("slackapp:channels.hatHolders");

// Slack usergroups
exports.CARS_USERGROUP = str("slackapp:usergroups.cars");
exports.BIKES_USERGROUP = str("slackapp:usergroups.bikes");

const waysToHelp = volunteersFields.waysToHelp_options;
exports.VOLUNTEER_INTERESTS_TO_SLACK_CHANNELS = {
  [waysToHelp.artsDesignFilm]: [exports.ARTS_CHANNEL],
  [waysToHelp.bikeDelivery]: [
    exports.CARS_AND_BIKES_CHANNEL,
    exports.DELIVERY_CHANNEL,
  ],
  [waysToHelp.carDelivery]: [
    exports.CARS_AND_BIKES_CHANNEL,
    exports.DELIVERY_CHANNEL,
  ],
  [waysToHelp.onFootDelivery]: [exports.DELIVERY_CHANNEL],
  [waysToHelp.childCare]: [],
  [waysToHelp.financialSupport]: [],
  [waysToHelp.phoningNeighborsInNeed]: [],
  [waysToHelp.techAdminSupport]: [exports.TECH_CHANNEL],
  [waysToHelp.flyering]: [exports.FLYERS_CHANNEL],
  [waysToHelp.iHaveAPrinter]: [exports.FLYERS_CHANNEL],
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
  [waysToHelp.iHaveAPrinter]: [],
};
