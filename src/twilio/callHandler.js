const twilio = require("twilio");

module.exports = (req, res) => {
  const response = new twilio.twiml.VoiceResponse();
  if (process.env.TWILIO_VOICEMAIL_URL) {
    response.play(process.env.TWILIO_VOICEMAIL_URL);
  } else {
    response.say(
      { voice: "alice", language: "en-US" },
      "Thanks for calling our mutual aid group. Please tell us what you need," +
        " and then a neighbor volunteer will contact you soon. Stay safe!"
    );
  }

  response.record({
    action: "/twilio/call-handler-callback"
  });

  res.set("Content-Type", "text/xml");
  res.send(response.toString());
};
