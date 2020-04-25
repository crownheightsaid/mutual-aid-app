const twilio = require("twilio");
const { str } = require("~strings/i18nextWrappers");

module.exports = (req, res) => {
  const response = new twilio.twiml.VoiceResponse();
  const voicemailUrl = str("twilio:home.welcome.voicemail_url");
  if (voicemailUrl) {
    response.play(voicemailUrl);
  } else {
    response.say(
      { voice: "alice", language: "en-US" },
      str(
        "twilio:home.welcome.messageWhenNoVoicemail",
        "Thanks for calling our mutual aid group. Please tell us what you need, and then a neighbor volunteer will contact you soon. Stay safe!"
      )
    );
  }

  response.record({
    action: "/twilio/call-handler-callback"
  });

  res.set("Content-Type", "text/xml");
  res.send(response.toString());
};
