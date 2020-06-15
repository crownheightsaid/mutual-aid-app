exports.sendSms = async (req, res) => {
  console.log(req.body);
  return res.send({ success: true });
};
