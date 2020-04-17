const { createRequest, findRequestByExternalId } = require("~airtable/bases");

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
    "This is a request from a different system.\n",
    "The type of support requested is:\n",
    manyc.supportType || "n/a",
    "\nIn a free-form request they said:\n",
    manyc.otherSupport || "nothing",
    "\nThey are in this hard-hit community:\n",
    manyc.community || "n/a",
    "\nNeighborhoods (please fill out manually for now):\n",
    manyc.neighborhood || "n/a"
  ];
  const nycmaRequest = {
    message: requestMessage.join(" "),
    phone: manyc.phone || "If there's no email too, please tell #tech!",
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
