exports.handler = function voiceMessage(context, event, callback) {
  const response = new Twilio.twiml.VoiceResponse(); // eslint-disable-line no-undef
  switch (event.Digits) {
    case "1":
      response.play("ch_message1.mp3");
      response.record({
        action: "/after-input?area=ch",
        timeout: "5"
      });
      console.log("redirecting to crown heights");
      break;
    case "2": // Flatbush
      response.play("flatbush_message.mp3");
      console.log("redirecting to beyond crown heights");
      response.redirect("/after-input?area=flatbush");
      break;
    case "3": // Brownsville or Ocean Hill
      response.play("brownsville_message.mp3");
      console.log("redirecting to beyond crown heights");
      response.redirect("/after-input?area=brownsville");
      break;
    case "4": // East New York
      response.play("eny_message.mp3");
      console.log("redirecting to beyond crown heights");
      response.redirect("/after-input?area=eny");
      break;
    default:
      response.pause({
        length: 1
      });
      response
        .gather({ numDigits: 1, timeout: 60, actionOnEmptyResult: "true" })
        .play("message1.mp3");
      console.log("playing message");
    //  End of SWITCH block
  }

  callback(null, response);
};
