const axios = require("axios");

exports.nycmaTest = async (req, res, next) => {
  if (!req.body.nycma) {
    return next(
      "Expected nycma data to be set on request body. This middlware should be used after body-parser."
    );
  }
  const { nycma } = req.body;

  try {
    const response = await axios.post(process.env.NYCMA_URL, {
      id: nycma.id,
      auth: {
        username: "crownheights",
        password: "password"
      }
    });
    console.log(`response: ${response}`);
  } catch (e) {
    console.log(`req error: ${e}`);
  }

  res.send("Some response");
};
