exports.handler = function(context, event, callback) {
  const response = new Twilio.twiml.VoiceResponse();
  switch (event.Digits) {
    case "9":
      response.say(
        "Thank you. We will send you more information in a text message. Stay safe!"
      );
      console.log("redirecting to sms");
      response.redirect("sms/pause-resources");
      break;
    default:
      response.pause({
        length: 2
      });
      response
        .gather({ numDigits: 1, timeout: 30, actionOnEmptyResult: "true" })
        .play("pause1.mp3");
      console.log("playing message");
    //  End of SWITCH block
  }

  callback(null, response);
};
