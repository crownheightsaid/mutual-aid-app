const { airbase } = require("~airtable/bases");

const volunteersTableName = (exports.volunteersTableName = "Volunteers");
const volunteersTable = (exports.volunteersTable = airbase(
  volunteersTableName
));
const fields = (exports.volunteersFields = {
  email: "volunteer_email",
  phone: "volunteer_phone",
  streetFirst: "volunteer_street_1",
  streetSecond: "volunteer_street_2",
  languages: "volunteer_languages",
  languages_options: {
    spanish: "Spanish",
    french: "French",
    english: "English",
    russian: "Russian",
    chinese: "Chinese",
    german: "German",
    arabic: "Arabic",
    yiddish: "Yiddish",
    bengali: "Bengali",
    italian: "Italian",
    korean: "Korean",
    vietnamese: "Vietnamese",
    hindi: "Hindi",
    polski: "Polski",
    portuguese: "Portuguese",
  },
  waysToHelp: "volunteer_ways_to_help",
  waysToHelp_options: {
    bikeDelivery: "Bike delivery",
    carDelivery: "Car delivery",
    financialSupport: "Financial support",
    childCare: "Child care",
    phoningNeighborsInNeed: "Phoning Neighbors in need",
    onFootDelivery: "On foot delivery",
    techAdminSupport: "Tech/admin support",
    flyering: "Flyering",
    iHaveAPrinter: "I have a printer!",
    artsDesignFilm: "Arts/design/film",
  },
  extraInfo: "volunteer_extra_info",
  slackId: "volunteer_slack_id",
  deliveryRequests: "Requests: Delivery",
  intakeRequests: "Requests: Intake",
  quadrant: "volunteer_quadrant",
  quadrant_options: {
    northwest: "northwest",
    southwest: "southwest",
    northeast: "northeast",
    southeast: "southeast",
    iDontKnow: "i don't know",
  },
  name: "volunter_name",
  howFound: "volunteer_howfind",
  trained: "volunteer_trained",
  createdTime: "Created Time",
});
