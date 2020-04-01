const { createRequest } = require("../../../airtable.js");

exports.nycmaIntakeHandler = async (req, res, next) => {
  if (!req.body.nycma) {
    return next(
      "Expected nycma data to be set on request body. This middlware should be used after body-parser."
    );
  }
  // TODO: need immediacy, cross streets and others are in the nycma form
  const { nycma } = req.body;
  const requestMessage = [
    "This is a request from a different system.",
    "The type of support requested is:",
    nycma.supportType,
    "In a free-form request they said:",
    nycma.otherSupport || "nothing",
    "They are in this hard-hit community:",
    nycma.community || "n/a"
  ];
  const nycmaRequest = {
    message: requestMessage.join(" "),
    phone: "",
    externalId: nycma.id,
    source: "nycma"
  };
  const [record, e] = createRequest(nycmaRequest);
  if (e) {
    const err = new Error("Couldn't create request in Airtable");
    err.statusCode = 500;
    return next(err);
  }

  console.log(`Created request: ${record.getId()}`);
  return next();
};
