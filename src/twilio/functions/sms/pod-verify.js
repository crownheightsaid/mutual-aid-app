exports.handler = function incomingSms(context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse(); // eslint-disable-line
  const phone = event.From;
  const podpass = event.Body;
  const twilioSid = event.SmsSid; // SMS unique ID

  var Airtable = require('airtable'); // eslint-disable-line
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: context.AIRTABLE_API_KEY // eslint-disable-line
  });

  const checkvolbase = Airtable.base("appqIAsILK5TBU5QG"); // pod list base
  const requestsbase = Airtable.base("apppK7mrvMPcwtv6d"); // request base

  let name = "";
  let last = "";
  let volrecord = "";

  if (podpass === "pod") {
    twiml.message(
      `hello from crown heights mutual aid! what are you requesting a reimbursement code for, for your pod?`
    );
    callback(null, twiml);
  } else {
    checkvolbase("Pod Requesters")
      .select({
        maxRecords: 1,
        filterByFormula: `({Phone} = '${phone}')`,
      })
      .firstPage(function checkPhone(err, records) {
        if (err) {
          console.error(err);
          return;
        }
        if (records.length === 0) {
          console.log("no one in the base with that number");
          twiml.message(
            `hmm, it doesn't look like you're signed up to create requests this way. please talk to the intake working group, on slack at wg_intake!`
          );
          callback(null, twiml);
        } else {
          records.forEach(function passRequest(record) { // eslint-disable-line
            console.log("phone number checks out!");
            name = record.get("First Name");
            last = record.get("Last Name");
            volrecord = record.get("Vol Table Record");
            createRecord();
          });
        }
      });
  }

  function createRecord() {
    console.log("creating record");
    requestsbase("Requests").create(
      {
        "Intake General Notes": event.Body,
        Phone: phone,
        "Twilio Call Sid": twilioSid,
        "Text or Voice?": "text",
        "Neighborhood MA-NYC": "Crown Heights",
        Status: "Delivery Assigned",
        Message: "this is a request for a pod",
        "First Name": name,
        "Intake volunteer": [volrecord],
        "Delivery volunteer": `${name} ${last}`,
        "Pod?": "pod",
      },
      function responseTxt(err, record) {
        if (err) {
          console.error(err);
          return;
        }
        const requestcode = record.getId(); // Airtable id
        console.log(requestcode);
        const shortcode = requestcode.substr(-6).toUpperCase();
        console.log(shortcode);
        twiml.message(
          `thank you for checking on your pod, ${name}! you can use the code ${shortcode} to fill out this CHMA reimbursement form: https://airtable.com/shrnf6M0YLn8IwJ71`
        );
        callback(null, twiml);
      }
    );
  } // end of createRecord
}; // end of exports.handler
