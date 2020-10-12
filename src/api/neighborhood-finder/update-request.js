const {
  updateRequestByCode,
  findRequestByCode,
} = require("~airtable/tables/requests");
const { fields: requestFields } = require("~airtable/tables/requestsSchema");

exports.neighborhoodFinderUpdateRequestHandler = async (req, res) => {
  const { requestCode, neighborhoodData } = req.body;
  if (!requestCode || !neighborhoodData) {
    return res.status(400).send({
      message: "Expected `requestCode` and `neighborhoodData` in payload",
    });
  }

  const [requestObj, _requestErr] = await findRequestByCode(requestCode);

  if (!requestObj) {
    return res
      .status(400)
      .send({ message: `Unable to find request with code ${requestCode}` });
  }

  const {
    /* eslint-disable-next-line */
    intersection: { street_1, street_2 },
    quadrant,
  } = neighborhoodData;

  const [_updated, updateErr] = await updateRequestByCode(requestCode, {
    [requestFields.crossStreetFirst]: street_1,
    [requestFields.crossStreetSecond]: street_2,
    [requestFields.neighborhoodArea]: Object.values(
      requestFields.neighborhoodArea_options
    ).includes(quadrant)
      ? quadrant
      : requestFields.neighborhoodArea_options.notCrownHeights,
  });

  if (updateErr) {
    return res.send({
      success: false,
      error: `Failed to update record: ${updateErr}`,
    });
  }

  return res.send({ success: true });
};
