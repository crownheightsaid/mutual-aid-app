const client = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSms = async (req, res) => {
  console.log(req.body);
  const { phoneNumber, smsMessage } = req.body;

  if (!phoneNumber || !smsMessage) {
    return res.status(400).send({
      message: "Expected `phoneNumber` and `message` in payload"
    });
  }

  await client.messages.create({
    body: smsMessage,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });

  return res.send({ success: true });
};
