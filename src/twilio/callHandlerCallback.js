const twilio = require("twilio");
const {
  createRequest,
  findRequestByPhone,
} = require("~airtable/tables/requests");
const { str } = require("~strings/i18nextWrappers");

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
    source: "voice",
  };
  const [record, e] = await createRequest(newRequest);
  if (record) {
    console.log(`New record from twilio voice: ${record.getId()}`);
  }

  // This most likely won't be played. People usually hang up after voicemail.
  const response = new twilio.twiml.VoiceResponse();
  if (e) {
    console.log(`Twilio callback error: ${e}`);
    response.say(
      { voice: "alice", language: "en-US" },
      str(
        "twilio:goodbye.error",
        "Sorry there was an error on our end. Please call back in a minute."
      )
    );
  } else {
    response.say(
      { voice: "alice", language: "en-US" },
      str(
        "twilio:goodbye.success",
        "Thank you. You will hear from a neighbor as soon as possible."
      )
    );
  }

  res.set("Content-Type", "text/xml");
  res.send(response.toString());
};
