const twilio = require("twilio");
const {
  createRequest,
  findRequestByPhone
} = require("~airtable/tables/requests");

module.exports = async (req, res) => {
  const twilReq = req.body;

  const twilioSid = twilReq.CallSid;
  const recordingUrl = twilReq.RecordingUrl;
  const phone = twilReq.From;
  let status = "";

  const [request, _err] = await findRequestByPhone(phone);
  if (request) {
    status = "Duplicate";
  }

  const newRequest = {
    message: recordingUrl,
    twilioSid,
    phone,
    status,
    source: "voice"
  };
  const [record, e] = await createRequest(newRequest);
  if (record) {
    console.log(`New record from twilio voice: ${record.getId()}`);
  }

  const response = new twilio.twiml.VoiceResponse();
  if (e) {
    response.say(
      { voice: "alice", language: "en-US" },
      "Sorry there was an error on our end. Please call back in a minute."
    );
  } else {
    response.say(
      { voice: "alice", language: "en-US" },
      "Thank you. You will hear from a neighbor as soon as possible."
    );
  }

  res.set("Content-Type", "text/xml");
  res.send(response.toString());
};
