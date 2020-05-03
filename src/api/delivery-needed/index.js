const { findDeliveryNeededRequests } = require("~airtable/tables/requests");
const { fields } = require("~airtable/tables/requests");
const { fetchCoordFromCrossStreets } = require("./fetchCoordFromCrossStreets");
const slackapi = require("~slack/webApi");

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
    let slackPermalink = {};
    const location = await fetchCoordFromCrossStreets(
      `
      ${r.fields[crossStreetFirst]},
      ${r.fields[crossStreetSecond]},
      Brooklyn
      `
    );

    try {
      metaJSON = JSON.parse(r.fields[meta]);
    } catch {
      console.error(
        "[deliveryNeededRequestHandler] could not parse meta",
        r.fields.meta
      );
    }

    try {
      const channel = metaJSON.slack_channel;
      const timestamp = metaJSON.slack_ts;
      slackPermalink = await slackapi.chat.getPermalink({
        channel,
        message_ts: timestamp
      });
    } catch {
      console.error(`[deliveryNeededRequestHandler] could not fetch slack URL
        for requestCode: ${r.fields[code]} channel: ${metaJSON.slack_channel} and timestamp: ${metaJSON.slack_ts}`);
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
          slackPermalink: slackPermalink.ok ? slackPermalink.permalink : ""
        }
      }
    };
  });

  const requestsClean = await Promise.all(requestsWithCoordsPromises);
  return res.send({ type: "FeatureCollection", features: requestsClean });
};
