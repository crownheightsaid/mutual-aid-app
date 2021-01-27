const { airbase } = require("~airtable/bases");

// ==================================================================
// Schema
// ==================================================================

const requestsTableName = (exports.tableName = "Requests");
exports.table = airbase(requestsTableName);
const fields = (exports.fields = {
  phone: "Phone",
  time: "Time",
  type: "Text or Voice?",
  type_options: {
    text: "text",
    voice: "voice",
    manyc: "manyc",
    email: "email",
  },
  message: "Message",
  crossStreetFirst: "Cross Street #1",
  crossStreetSecond: "Cross Street #2",
  email: "Email Address",
  neighborhoodArea: "Neighborhood Area (See Map)",
  neighborhoodArea_options: {
    ne: "NE",
    nw: "NW",
    se: "SE",
    sw: "SW",
    notCrownHeights: "Other - not Crown Heights",
  },
  languages: "Languages",
  languages_options: {
    spanish: "Spanish",
    chineseMandarin: "Chinese - Mandarin",
    chineseCantonese: "Chinese - Cantonese",
    haitianKreyol: "Haitian Kreyol",
    russian: "Russian",
    bengali: "Bengali",
    french: "French",
    yiddish: "Yiddish",
    italian: "Italian",
    korean: "Korean",
    arabic: "Arabic",
    tagalog: "Tagalog",
    polish: "Polish",
    asl: "ASL",
    english: "English",
    eglish: "eglish",
  },
  supportType: "What type(s) of support are you seeking?",
  supportType_options: {
    delivery: "Deliver groceries or supplies to me",
    prescriptionPickUp: "Pick up a prescription for me",
    "1On1CheckInsPhoneCallZoomEtcToTouchBaseWithANeighbor":
      "1 on 1 check-ins (phone call, Zoom, etc to touch base with a neighbor)",
    financialSupport: "Financial support",
    translation:
      "Translation and interpretation into a language other than English",
    socialServices:
      "Social Services guidance (filing for medicare, unemployment, etc)",
    other: "Other (please describe below)",
  },
  financialSupportNeeded: "Financial Support Needed?",
  financialSupportNeeded_options: {
    yes: "yes - need donation",
    no: "no donation need",
  },
  intakeVolunteer: "Intake volunteer",
  deliveryVolunteer: "Delivery volunteer",
  timeSensitivity: "Time Sensitivity",
  intakeNotes: "Intake General Notes",
  startEditingHere: "Start Editing Here!",
  receipts: "Receipts",
  code: "Code",
  status: "Status",
  status_options: {
    dispatchNeeded: "Dispatch Needed",
    dispatchStarted: "Dispatch Started",
    noAnswer: "No Answer (call back)",
    deliveryNeeded: "Delivery Needed",
    duplicate: "Duplicate",
    deliveryAssigned: "Delivery Assigned",
    requestComplete: "Request Complete",
    beyondCrownHeights: "Beyond Crown Heights",
    otherFollowup: "Other Followup",
    sentToAnotherGroup: "Sent to Another Group",
    needsPosting: "Needs Posting!",
    brownsville: "Brownsville/East NY",
  },
  externalId: "External Id",
  deliverySlackId: "Delivery slackId",
  lastModified: "Last Modified",
  meta: "Meta",
  lastProcessed: "Last Processed",
  firstName: "First Name",
  triggerBackfill: "Trigger Backfill",
  neighborhood: "Neighborhood MA-NYC",
  householdSize: "Household Size",
  forDrivingClusters: "For Driving Clusters",
  dateChangedToDeliveryNeeded: "Date Changed to Delivery Needed",
});
exports.SENSITIVE_FIELDS = [
  fields.phone,
  fields.email,
  fields.message,
  fields.intakeNotes,
];
