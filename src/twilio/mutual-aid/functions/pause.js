exports.handler = function(context, event, callback) {
  const response = new Twilio.twiml.VoiceResponse();
  switch (event.Digits) {
    case "9":
      response.say(
        "Thank you. We will send you more information in a text message. Stay safe!"
      );
      sendSMS();
      break;
    default:
      response.pause({
        length: 2
      });
      response
        .gather({ numDigits: 1, timeout: 30, actionOnEmptyResult: "true" })
        .play("pause1.mp3");
  }

  function sendSMS() {
    const twilioClient = context.getTwilioClient();
    twilioClient.messages.create({
      to: event.From,
      from: event.To,
      body:
        "Hello, thank you for contacting Crown Heights Mutual Aid.\n\nFor all neighborhoods, you can visit https://mutualaid.nyc/resources-groups to find a Mutual Aid group near you.\n\nFor support with emergency cash assistance, unemployment, financial counseling, free food programs, and more, visit https://portal.311.nyc.gov/article/?kanumber=KA-03301. For information about emergency meal delivery, food pantries and grab-and-go meal sites, visit NYC.gov/getFood.\n\nYou can also text FOOD to 726879 to make a reservation to pick up food at a pantry within walking distance of your home, no questions asked.\n\nStay safe!"
    });
  }

  callback(null, response);
};
