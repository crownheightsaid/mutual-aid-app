const {
  updateRequestByCode,
  findRequestByCode
} = require("../../../airtable.js");

const NEIGHBORHOOD_AREA_UNAVAILABLE_OPTION = "Other - not Crown Heights";

const makeErr = (code, msg) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

exports.neighborhoodFinderHandler = async (req, res, next) => {
  const { requestCode, neighborhoodData } = req.body;
  if (!requestCode || !neighborhoodData) {
    return next(
      makeErr(400, "`requestCode` and `neighborhoodData` is expected")
    );
  }

  const [requestObj, _requestErr] = await findRequestByCode(requestCode);

  if (!requestObj) {
    return res.status(400).send({message: `Unable to find request with code ${requestCode}`})
  }

  const {
    /* eslint-disable-next-line */
    intersection: { street_1, street_2 },
    quadrant
  } = neighborhoodData;

  const [_updated, updateErr] = await updateRequestByCode(requestCode, {
    "Cross Street #1": street_1,
    "Cross Street #2": street_2,
    "Neighborhood Area (See Map)": quadrant || NEIGHBORHOOD_AREA_UNAVAILABLE_OPTION
  });

  if (updateErr) {
    return res.send({
      success: false,
      error: `Failed to update record: ${updateErr}`
    });
  }

  res.send({ success: true });
};
