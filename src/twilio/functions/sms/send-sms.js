exports.handler = function sendSms(context, event, callback) {
  const twilioClient = context.getTwilioClient();
  twilioClient.messages.create(
    {
      to: event.to,
      from: event.from,
      body: event.message
    },
    function loggingCallback() {
      console.log("1 message sent");
      const response = new Twilio.Response(); // eslint-disable-line no-undef

      // We call this function from web, so allow cross-origin
      const headers = {
        "Access-Control-Allow-Origin": "*"
      };

      // Set headers in response
      response.setHeaders(headers);
      response.setBody({ success: true });

      callback(null, response);
    }
  );
};
