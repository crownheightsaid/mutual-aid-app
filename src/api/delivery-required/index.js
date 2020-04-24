const { findDeliveryNeededRequests } = require("~airtable/tables/requests");
const { fields } = require("~airtable/tables/requests");

exports.deliveryRequiredRequestHandler = async (req, res) => {
  const [requestObj, requestErr] = await findDeliveryNeededRequests();

  if (!requestObj) {
    return res
      .status(400)
      .send({ message: `Error fetching requests: ${requestErr}` });
  }

  const {
    code,
    crossStreetFirst,
    crossStreetSecond,
    meta,
    neighborhoodAreaSeeMap
  } = fields;

  const requestsClean = requestObj.map(r => {
    let metaJSON = {};
    let slackChannelId;

    try {
      metaJSON = JSON.parse(r.fields[meta]);
      slackChannelId = metaJSON.slackChannel;
    } catch {
      console.log("could not parse", r.fields.meta);
    }
    return {
      [code]: r.fields[code],
      [crossStreetFirst]: r.fields[crossStreetFirst],
      [crossStreetSecond]: r.fields[crossStreetSecond],
      [neighborhoodAreaSeeMap]: r.fields[neighborhoodAreaSeeMap],
      slackChannelId
    };
  });
  return res.send(requestsClean);
};
