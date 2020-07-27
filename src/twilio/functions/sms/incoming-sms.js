exports.handler = function incomingSms(context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse(); // eslint-disable-line
  const phone = event.From;
  const request = event.Body;
  const twilioSid = event.SmsSid; // SMS unique ID

  var Airtable = require('airtable'); // eslint-disable-line
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
<<<<<<< HEAD
    apiKey: context.AIRTABLE_API_KEY,
=======
    apiKey: context.AIRTABLE_API_KEY
>>>>>>> 79b161d9d25afa4ea47c933bad330d311081026a
  });

  const base = Airtable.base("apppK7mrvMPcwtv6d");
  let status = "";

  base("Requests")
    .select({
      maxRecords: 1,
      fields: ["Phone"],
<<<<<<< HEAD
      filterByFormula: `({Phone} = '${phone}')`,
=======
      filterByFormula: `({Phone} = '${phone}')`
>>>>>>> 79b161d9d25afa4ea47c933bad330d311081026a
    })
    .firstPage(function checkDuplicate(err, records) {
      if (err) {
        console.error(err);
        return;
      }
      if (records.length === 0) {
        status = "Dispatch Needed";
        createRecord();
      } else {
        records.forEach(function writeDuplicate(record) { // eslint-disable-line
          console.log("Duplicate");
          status = "Duplicate";
          createRecord();
        });
      }
    });

  function createRecord() {
    console.log("creating record");
    base("Requests").create(
      {
        Message: request,
        Phone: phone,
        "Twilio Call Sid": twilioSid,
        "Text or Voice?": "text",
<<<<<<< HEAD
        Status: status,
=======
        Status: status
>>>>>>> 79b161d9d25afa4ea47c933bad330d311081026a
      },
      function responseTxt(err, record) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(record.getId()); // each record has a unique Airtable ID
        twiml.message(
          "thank you for reaching out to crown heights mutual aid - a neighbor volunteer will follow up with you as soon as we can. stay safe!"
        );
        callback(null, twiml);
      }
    );
  } // end of createRecord
}; // end of exports.handler
