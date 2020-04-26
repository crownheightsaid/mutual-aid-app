const { findDeliveryNeededRequests } = require("~airtable/tables/requests");
const { fields } = require("~airtable/tables/requests");
const { fetchCoordFromCrossStreets } = require("./fetchCoordFromCrossStreets");

exports.deliveryNeededRequestHandler = async (req, res) => {
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

  const requestsWithCoordsPromises = requestObj.map(async r => {
    let metaJSON = {};
    let slackChannelId;
    const location = await fetchCoordFromCrossStreets(
      `
      ${r.fields[crossStreetFirst]},
      ${r.fields[crossStreetSecond]},
      Brooklyn
      `
    );

    try {
      metaJSON = JSON.parse(r.fields[meta]);
      slackChannelId = metaJSON.slackChannel;
    } catch {
      console.log("could not parse", r.fields.meta);
    }
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [location.lng, location.lat]
      },
      properties: {
        title: r.fields[code],
        meta: {
          [code]: r.fields[code],
          [crossStreetFirst]: r.fields[crossStreetFirst],
          [crossStreetSecond]: r.fields[crossStreetSecond],
          [neighborhoodAreaSeeMap]: r.fields[neighborhoodAreaSeeMap],
          slackChannelId
        }
      }
    };
  });

  const requestsClean = await Promise.all(requestsWithCoordsPromises);
  return res.send({ type: "FeatureCollection", features: requestsClean });
};
