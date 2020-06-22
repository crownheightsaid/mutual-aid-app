exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();
  twiml.message(
    "You have reached Crown Heights Mutual Aid. We are a network of neighbors helping neighbors. We are volunteers who give our time, pool our resources, and stand in solidarity with our neighbors in need.\n\nBetween June 21st and July 19th 2020 we will not be able to take new calls. We are using this time to call back the thousands of neighbors who called us before June 21st.\n\nIf you called us before June 21st, your call is recorded. We are prioritizing our Crown Heights neighbors at this time, but will do our best to call everyone back. We are planning to re-open our phone line on July 19th 2020."
  );
  console.log("message sent");
  secondSMS();

  function secondSMS() {
    const twilioClient = context.getTwilioClient();
    twilioClient.messages.create({
      to: event.From,
      from: event.To,
      body:
        "In the meantime we can provide other resources in Brooklyn. We will have a list on our website at crownheightsmutualaid.com. We will post updates on facebook https://www.facebook.com/groups/496603171016990 and instagram, @crownheightsaid.\n\nYou can visit https://mutualaid.nyc/resources-groups to find a Mutual Aid group in your neighborhood. You can also text FOOD to 726879 to make a reservation to pick up food at a pantry within walking distance of your home, in any borough.\n\nStay safe!"
    });
  }

  callback(null, twiml);
};
