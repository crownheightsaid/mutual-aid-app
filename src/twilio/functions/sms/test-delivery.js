exports.handler = function codeSms(context, event, callback) { // eslint-disable-line
  const Airtable = require("airtable"); // eslint-disable-line
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: context.AIRTABLE_API_KEY // eslint-disable-line
  });

  const base = Airtable.base("apppPfEXed7SRcKmB"); // staging base
  let code = event.body.requestCode;
  const deliveryPhone = event.body.phoneNumber;
  const deliveryName = "MAB TEST"; // get real delivery vol name from request
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
        const firstName = record.get("First Name");
        const list = record.get("Intake General Notes");
        const street1 = record.get("Cross Street #1");
        const street2 = record.get("Cross Street #2");
        const volrecord = record.get("Intake volunteer");

        // below: changes request status to "Delivery Assigned"
        // react/express now handles assigning the delivery
        /* base("Requests").update(
          record.id,
          {
            Status: "Delivery Assigned",
          },
          function reAssign(reerror) {
            if (reerror) {
              console.error(reerror);
            }
          }
        ); */

        // below, uses linked 'Intake volunteer' record id to get phone number and name from Volunteers table
        base("Volunteers").find(volrecord, function checkVolunteer(volerror, vrecord) { // eslint-disable-line
          if (volerror) {
            console.error(volerror);
            return;
          }
          console.log("Retrieved", vrecord.id);
          const intakephone = vrecord.get("volunteer_phone");
          const intakename = vrecord.get("volunteer_name");

          // sends SMS out to delivery volunteer
          const twilioClient = context.getTwilioClient();

          twilioClient.messages
            .create({
              to: deliveryPhone, // need delivery volunteer phone number here
              from: "+19175403381", // twilio number here
              body: `Thanks for taking on this delivery for ${firstName}!\nCODE = ${code}.\n\nTheir phone is ${phone}, you will need to get in touch with them about the full address. Their cross streets are ${street1} & ${street2}.\n\n${firstName}'s grocery list is: ${list}\n\nThe intake volunteer for this request is ${intakename}. Their phone # is ${intakephone}, and they can help if you have any questions - they'll reach out to you to follow up and make sure the delivery goes well!`,
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
