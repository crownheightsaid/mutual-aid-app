exports.handler = function sendTwilioSms(context, event, callback) {
  const twilioClient = context.getTwilioClient();
  twilioClient.messages.create(
    {
      to: event.to,
      from: event.from,
      body: event.message
    },
    function loggingCallback() {
      console.log("1 message sent");
      // Callback is placed inside the successful response
      callback();
    }
  );
};
