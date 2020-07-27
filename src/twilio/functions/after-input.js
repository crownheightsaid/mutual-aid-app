exports.handler = function recordRequest(context, event, callback) {
  console.log(`CallSID:${event.CallSid}`);

  const twilioSid = event.CallSid;
  const phone = event.From;
  const neighborhood = event.area;
  const recordingUrl = event.RecordingUrl;
  let status = "";
  let manyc = "";
  let carcluster = "";

  const Airtable = require('airtable'); // eslint-disable-line
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: context.AIRTABLE_API_KEY // set in our environment variables
  });

  const base = Airtable.base("apppK7mrvMPcwtv6d");

  if (neighborhood === "ch") {
    status = "Dispatch Needed";
    manyc = "Crown Heights";
    carcluster = "";
  }

  base("Requests")
    .select({
      maxRecords: 1,
      view: "Recent Requests",
      fields: ["Phone", "Time", "Status"],
      sort: [{ field: "Time", direction: "asc" }],
      filterByFormula: `({Phone} = '${phone}')`
    })
    .firstPage(function checkDuplicate(err, records) {
      if (err) {
        console.error(err);
        return;
      }
      if (records.length === 0) {
        createRecord();
      } else {
        records.forEach(function createDuplicate(record) { // eslint-disable-line
          console.log("Duplicate");
          status = "Duplicate";
          createRecord();
        });
      }
    });

  function createRecord() {
  base('Requests').create({ // eslint-disable-line
        "Neighborhood MA-NYC": manyc,
        Message: recordingUrl,
        Phone: phone,
        "Text or Voice?": "voice",
        "Twilio Call Sid": twilioSid,
        "For Driving Clusters": carcluster,
        Status: status
      },
      function endRecord(err, record) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`created record: ${record.getId()}`);
        const response = new Twilio.twiml.VoiceResponse(); // eslint-disable-line no-undef
        response.say({ voice: "alice", language: "en-US" }, "Thank you.");
        callback(null, response);
      }
    );
  } // end of createRecord
}; // end of exports.handler
