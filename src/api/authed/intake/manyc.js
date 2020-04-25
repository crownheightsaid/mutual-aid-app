const {
  createRequest,
  findRequestByExternalId
} = require("~airtable/tables/requests");
const { str } = require("~strings/i18nextWrappers");

exports.nycmaIntakeHandler = async (req, res, next) => {
  if (!req.body.manyc) {
    return next(
      "Expected manyc data to be set on request body. This middlware should be used after body-parser."
    );
  }
  // TODO: need immediacy, cross streets and others are in the nycma form
  const { manyc } = req.body;

  const [existingRequest] = await findRequestByExternalId(manyc.id);
  if (existingRequest) {
    const err = new Error("Request with that external ID already exists");
    err.statusCode = 409;
    return next(err);
  }

  const requestMessage = [
    `${str(
      "airtable:manyc.request.message.intro",
      "This is a request from a different system."
    )}\n`,
    `${str(
      "airtable:manyc.request.message.supportType",
      "The type of support requested is:"
    )}\n`,
    manyc.supportType || str("common:notAvailable", "n/a"),
    `\n${str(
      "airtable:manyc.request.message.otherSupport",
      "In a free-form request they said:"
    )}\n`,
    manyc.otherSupport || str("common:notAvailable", "n/a"),
    `\n${str(
      "airtable:manyc.request.message.community",
      "They are in this hard-hit community:"
    )}\n`,
    manyc.community || str("common:notAvailable", "n/a"),
    `\n${str(
      "airtable:manyc.request.message.neighborhoods",
      "Neighborhoods (please fill out manually for now):"
    )}\n`,
    manyc.neighborhood || str("common:notAvailable")
  ];
  const nycmaRequest = {
    message: requestMessage.join(" "),
    phone:
      manyc.phone ||
      str(
        "airtable:manyc.request.contactError",
        "If there's no email too, please tell #tech!"
      ),
    externalId: manyc.id,
    email: manyc.email || "",
    urgency: manyc.urgency || "",
    crossStreets: manyc.crossStreet,
    source: "manyc"
  };
  const [record, e] = await createRequest(nycmaRequest);
  if (e) {
    const err = new Error("Couldn't create request in Airtable");
    err.statusCode = 500;
    return next(err);
  }

  console.log(`Created request: ${record.getId()}`);
  res.send(record.getId());
  return record.getId();
};
