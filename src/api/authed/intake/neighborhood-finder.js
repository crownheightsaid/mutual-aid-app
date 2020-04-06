const {
  updateRequestByCode,
  findRequestByCode
} = require("../../../airtable.js");

const makeErr = (code, msg) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

exports.neighborhoodFinderHandler = async (req, res, next) => {
  const { requestCode, neighborhoodData } = req.body;
  if (!requestCode) {
    return next(makeErr(400, "`requestCode` is expected"));
  }

  const [requestObj, requestErr] = await findRequestByCode(requestCode);

  if (!requestObj) {
    return next(makeErr(400, requestErr));
  }

  const {
    /* eslint-disable-next-line */
    intersection: { street_1, street_2 },
    quadrant
  } = neighborhoodData;

  const [_, updateErr] = await updateRequestByCode(requestCode, {
    "Cross Street #1": street_1,
    "Cross Street #2": street_2,
    "Neighborhood Area (See Map)": quadrant.toUpperCase()
  });

  if (updateErr) {
    return res.send({
      success: false,
      error: `Failed to update record: ${updateErr}`
    });
  }

  res.send({ success: true });
};
