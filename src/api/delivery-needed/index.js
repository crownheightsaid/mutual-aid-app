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
    neighborhoodAreaSeeMap,
    firstName
  } = fields;

  const requestsWithCoordsPromises = requestObj.map(async r => {
    let metaJSON = {};
    let slackUrl = '';
    const location = await fetchCoordFromCrossStreets(
      `
      ${r.fields[crossStreetFirst]},
      ${r.fields[crossStreetSecond]},
      Brooklyn
      `
    );

    try {
      metaJSON = JSON.parse(r.fields[meta]);
      const slackChannelId = metaJSON.slack_channel;
      const slackTimestamp = metaJSON.slack_ts;
      slackUrl = `https://crownheightsmutualaid.slack.com/archives/${slackChannelId}/p${slackTimestamp}`
    } catch {
      console.log("[deliveryNeededRequestHandler] could not parse meta", r.fields.meta);
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
          [firstName]: r.fields[firstName],
          slackUrl
        }
      }
    };
  });

  const requestsClean = await Promise.all(requestsWithCoordsPromises);
  return res.send({ type: "FeatureCollection", features: requestsClean });
};
