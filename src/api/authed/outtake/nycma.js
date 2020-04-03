const {
  deleteRequest,
  findRequestByExternalId
} = require("../../../airtable.js");

exports.nycmaOuttakeHandler = async (req, res, next) => {
  if (!req.body.nycma) {
    return next(
      "Expected nycma data to be set on request body. This middlware should be used after body-parser."
    );
  }
  const { nycma } = req.body;
  const [requestRecord, findErr] = await findRequestByExternalId(nycma.id);
  if (findErr) {
    const err = new Error("Couldn't find externalId in Airtable");
    err.statusCode = 500;
    return next(err);
  }

  const [record, deleteErr] = await deleteRequest(requestRecord.getId());
  if (deleteErr) {
    const err = new Error("Couldn't delete request in Airtable");
    err.statusCode = 500;
    return next(err);
  }

  console.log(`Deleted request: ${record}`);
  res.send(record.getId());
  return record.getId();
};
