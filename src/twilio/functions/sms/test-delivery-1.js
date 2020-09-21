// an early version of the Twilio endpoint here, looks up all the values in Airtable (delivery volunteer name, intake volunteer phone, etc)
// future versions uses React web app to look up Airtable values, and Twilio endpoint only to send texts

exports.handler = function codeSms(context, event, callback) { // eslint-disable-line
  const Airtable = require("airtable"); // eslint-disable-line
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: context.AIRTABLE_API_KEY // eslint-disable-line
  });

  const base = Airtable.base("apppPfEXed7SRcKmB"); // staging base
  let code = event.body.requestCode;
  const deliveryPhone = event.body.phoneNumber;
  let deliveryName = "";
  let missinginfo = false;
  let missingintake = false;
  code = code.toUpperCase().trim();

  console.log("incoming message received");

  // below: looks up code in request Airtable, gets all important values
  base("Requests")
    .select({
      view: "Grid view", // from staging base
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
          missinginfo = true;
        }
        const street1 = record.get("Cross Street #1");
        if (typeof street1 === "undefined") {
          missinginfo = true;
        }
        const street2 = record.get("Cross Street #2");
        if (typeof street2 === "undefined") {
          missinginfo = true;
        }
        const volrecord = record.get("Intake volunteer");

        // looks for delivery volunteer name based on phone number
        base("Volunteers")
          .select({
            view: "Grid view", // from staging base
            maxRecords: 1,
            filterByFormula: `({volunteer_phone} = '${deliveryPhone}')`,
          })
          .firstPage(function deliveryNameSeek(derror, dnamerecords) {
            dnamerecords.forEach(function getName(dnamerecord) {
              console.log("Retrieved", dnamerecord.get("volunter_name"));
              console.log("ID", dnamerecord.id);
              deliveryName = dnamerecord.get("volunteer_name");
              if (typeof deliveryName === "undefined") {
                deliveryName = "a CHMA volunteer";
              }
            });
          });

        // below, uses linked 'Intake volunteer' record id to get phone number and name from Volunteers table
        base("Volunteers").find(volrecord, function checkVolunteer(volerror, vrecord) { // eslint-disable-line
          if (volerror) {
            console.error(volerror);
            return;
          }
          console.log("Retrieved", vrecord.id);
          const intakephone = vrecord.get("volunteer_phone");
          let intakename = vrecord.get("volunteer_name");

          if (typeof intakephone === "undefined") {
            missingintake = true;
          }

          if (typeof intakename === "undefined") {
            intakename = "ready to help";
          }

          let deliveryText = `Thanks for taking on this delivery for ${firstName}!\nCODE = ${code}.\n\nTheir phone is ${phone}, you will need to get in touch with them about the full address. Their cross streets are ${street1} & ${street2}.\n\n${firstName}'s grocery list is: ${list}\n\nThe intake volunteer for this request is ${intakename}. Their phone # is ${intakephone}, and they can help if you have any questions - they'll reach out to you to follow up and make sure the delivery goes well!`;

          if (missinginfo === true) {
            deliveryText = `Thanks for taking on this delivery for ${firstName}!\nCODE = ${code}.\n\nIt looks like some important info might be missing - please follow up with #wg_tech on Slack, or text your intake volunteer ${intakename} at ${intakephone} - we'll get it sorted out!`;
          }

          if (missingintake === true) {
            deliveryText = `Thanks for taking on this delivery for ${firstName}!\nCODE = ${code}.\n\nIt looks like some important info might be missing - please follow up with #intake_volunteers on Slack - we'll get it sorted out`;
          }

          // sends SMS out to delivery volunteer
          const twilioClient = context.getTwilioClient();

          twilioClient.messages
            .create({
              to: deliveryPhone,
              from: "+19175403381", // twilio number here
              body: deliveryText,
            })
            .then(function txtIntake() {
              twilioClient.messages.create(
                {
                  to: intakephone,
                  from: "+19175403381", // twilio number here
                  body: `hey! The request with code ${code} for ${firstName} has been picked up by ${deliveryName}! please remember to check in with them, and make sure the request gets completed - their phone # is ${deliveryPhone}. thnx!`,
                },
                function finish() {
                  console.log("2 messages sent");
                  // Callback is placed inside the successful response of the 2nd message
                  callback();
                }
              ); // end twilio create message
            }); // end textIntake
        }); // end checkVolunteer
      }); // end getRecordInfo
    }); // end seekRecords
};
