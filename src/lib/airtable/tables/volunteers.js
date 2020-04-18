const { airbase } = require("~airtable/bases");

exports.findVolunteerByEmail = async email => {
  try {
    const records = await volunteersTable
      .select({
        filterByFormula: `(LOWER({${fields.email}}) = '${email.toLowerCase()}')`
      })
      .firstPage();
    if (!records || records.length === 0) {
      return [null, `No volunteer signed up with email ${email}`];
    }
    return [records[0], null];
  } catch (e) {
    return [null, `Errors looking up volunteer by email ${email}: ${e}`];
  }
};

exports.findVolunteerById = async id => {
  try {
    return [await volunteersTable.find(id), null];
  } catch (e) {
    return [null, `Errors looking up volunteer by recordId ${id}: ${e}`];
  }
};

// ==================================================================
// Schema
// ==================================================================

const volunteersTableName = (exports.tableName = "Volunteers");
const volunteersTable = (exports.table = airbase(volunteersTableName));
const fields = (exports.fields = {
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
    portuguese: "Portuguese"
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
    artsDesignFilm: "Arts/design/film"
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
    iDontKnow: "i don't know"
  },
  name: "volunter_name",
  howFound: "volunteer_howfind",
  trained: "volunteer_trained",
  createdTime: "Created Time"
});
