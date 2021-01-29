exports.handler = function codeSms(context, event, callback) { // eslint-disable-line
  const Airtable = require("airtable"); // eslint-disable-line
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: context.AIRTABLE_API_KEY // eslint-disable-line
  });

  const base = Airtable.base("apppK7mrvMPcwtv6d"); // intake + vols base
  let code = event.body.requestCode;
  const { deliveryPhone, intakePhone } = event.body;
  let { deliveryName, intakeName } = event.body;
  let body = JSON.stringify(event.body); // eslint-disable-line
  let missingInfo = false;
  let missingIntake = false;
  code = code.toUpperCase().trim();

  console.log("incoming message received");
  console.log(`delivery phone: ${deliveryPhone}`);

  // below: looks up code in request Airtable, gets all important values about the requesting neighbor
  base("Requests")
    .select({
      maxRecords: 1,
      filterByFormula: `({Code} = '${code}')`,
    })
    .firstPage(function seekRecords(err, records) {
      records.forEach(function getRecordInfo(record) {
        console.log("Retrieved", record.get("Code"));
        console.log("ID", record.id);

        const phone = record.get("Phone");
        let firstName = record.get("First Name");
        if (typeof firstName === "undefined") {
          firstName = "your neighbor";
        }
        const list = record.get("Intake General Notes");
        if (typeof list === "undefined") {
          missingInfo = true;
        }
        const street1 = record.get("Cross Street #1");
        if (typeof street1 === "undefined") {
          missingInfo = true;
        }
        const street2 = record.get("Cross Street #2");
        if (typeof street2 === "undefined") {
          missingInfo = true;
        }
        if (intakePhone === " ") {
          missingIntake = true;
        }

        if (typeof intakeName === "undefined") {
          intakeName = "ready to help";
        }

        if (typeof deliveryName === "undefined") {
          deliveryName = "a CHMA volunteer";
        }

        let deliveryText = `Thanks for taking on this delivery for ${firstName}!\nCODE = ${code}.\n\nTheir phone is ${phone}, you will need to get in touch with them about the full address. Their cross streets are ${street1} & ${street2}.\n\n${firstName}'s grocery list is: ${list}\n\nThe intake volunteer for this request is ${intakeName}. Their phone # is ${intakePhone}, and they can help if you have any questions - they'll reach out to you to follow up and make sure the delivery goes well!`;

        if (missingInfo) {
          deliveryText = `Thanks for taking on this delivery for ${firstName}!\nCODE = ${code}.\n\nIt looks like some important info might be missing - please follow up with #intake_volunteers on Slack, or text your intake volunteer ${intakeName} at ${intakePhone} - we'll get it sorted out!`;
        }

        if (missingIntake) {
          deliveryText = `Thanks for taking on this delivery for ${firstName}!\nCODE = ${code}.\n\nIt looks like some important info might be missing - please follow up with #intake_volunteers on Slack - we'll get it sorted out`;
        }

        // sends SMS out to delivery volunteer
        const twilioClient = context.getTwilioClient();

        twilioClient.messages
          .create({
            to: deliveryPhone,
            from: "+13474180185", // twilio number here
            body: deliveryText,
          })
          .then(function txtIntake() {
            twilioClient.messages.create(
              {
                to: intakePhone,
                from: "+13474180185", // twilio number here
                body: `hey! The request with code ${code} for ${firstName} has been picked up by ${deliveryName}! please remember to check in with them, and make sure the request gets completed - their phone # is ${deliveryPhone}. thnx!`,
              },
              function finish() {
                console.log("2 messages sent");
                // Callback is placed inside the successful response of the 2nd message
                callback();
              }
            ); // end twilio create message
          }); // end textIntake
        //  }); // end checkVolunteer
      }); // end getRecordInfo
    }); // end seekRecords
};
