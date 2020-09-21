const { findDeliveryNeededRequests } = require("~airtable/tables/requests");
const { fields } = require("~airtable/tables/requests");
const { fetchCoordFromCrossStreets } = require("./fetchCoordFromCrossStreets");
const slackapi = require("~slack/webApi");
const {
  getDeliveryRequestNeedFormatted,
} = require("~airtable/deliveryrequests/getDeliveryRequestNeedFormatted");

const {
  code,
  crossStreetFirst,
  crossStreetSecond,
  meta,
  neighborhoodAreaSeeMap,
  firstName,
  forDrivingClusters,
  householdSize,
  timeSensitivity,
  intakeNotes,
  supportType,
} = fields;

<<<<<<< HEAD
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
=======
const makeFeature = async (r) => {
  let metaJSON = {};
  let slackPermalink = {};
  let timestamp;

  const location = await fetchCoordFromCrossStreets(
    `
>>>>>>> mab-open-phones-functions
      ${r.fields[crossStreetFirst]},
      ${r.fields[crossStreetSecond]},
      Brooklyn
      `
  );

  if (!location) {
    console.error(`[deliveryNeededRequestHandler] could not fetch address location 
      for requestCode: ${r.fields[code]}`);
    return null;
  }

  try {
    metaJSON = JSON.parse(r.fields[meta]);
  } catch {
    console.error(
      "[deliveryNeededRequestHandler] could not parse meta",
      r.fields.meta
    );
  }

<<<<<<< HEAD
    try {
      const channel = metaJSON.slack_channel;
      const timestamp = metaJSON.slack_ts;
      slackPermalink = await slackapi.chat.getPermalink({
        channel,
        message_ts: timestamp
      });
    } catch {
      console.error(`[deliveryNeededRequestHandler] could not fetch slack URL
=======
  try {
    const channel = metaJSON.slack_channel;
    timestamp = metaJSON.slack_ts;
    slackPermalink = await slackapi.chat.getPermalink({
      channel,
      message_ts: timestamp,
    });
  } catch {
    console.error(`[deliveryNeededRequestHandler] could not fetch slack URL
>>>>>>> mab-open-phones-functions
        for requestCode: ${r.fields[code]} channel: ${metaJSON.slack_channel} and timestamp: ${metaJSON.slack_ts}`);
  }

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
  const need = getDeliveryRequestNeedFormatted(r.fields[supportType], r.fields);

>>>>>>> upstream/master
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [location.lng, location.lat],
    },
    properties: {
      title: r.fields[code],
      meta: {
        [code]: r.fields[code],
        [crossStreetFirst]: r.fields[crossStreetFirst],
        [crossStreetSecond]: r.fields[crossStreetSecond],
        [neighborhoodAreaSeeMap]: r.fields[neighborhoodAreaSeeMap],
        [firstName]: r.fields[firstName],
        [forDrivingClusters]: Boolean(r.fields[forDrivingClusters]),
        [householdSize]: r.fields[householdSize],
        [timeSensitivity]: r.fields[timeSensitivity],
        [intakeNotes]: r.fields[intakeNotes],
        need,
        slackPermalink: slackPermalink.ok ? slackPermalink.permalink : "",
        timestamp,
        slackTs: metaJSON.slack_ts || "",
      },
    },
  };
};

exports.deliveryNeededRequestHandler = async (req, res) => {
  const [requestObj, requestErr] = await findDeliveryNeededRequests();

  if (!requestObj) {
    return res
      .status(400)
      .send({ message: `Error fetching requests: ${requestErr}` });
  }

  const regularRequestsPromises = requestObj
    .filter((r) => !r.fields[forDrivingClusters])
    .map(makeFeature);

  const clusterRequestsPromises = requestObj
    .filter((r) => Boolean(r.fields[forDrivingClusters]))
    .map(makeFeature);

  const regularRequests = await Promise.all(regularRequestsPromises);
  const clusterRequests = await Promise.all(clusterRequestsPromises);
>>>>>>> mab-open-phones-functions

  return res.send({
<<<<<<< HEAD
    type: "FeatureCollection",
    features: requestsClean.filter(request => !!request)
=======
    requests: {
      type: "FeatureCollection",
      features: regularRequests.filter((request) => !!request),
    },
    drivingClusterRequests: {
      type: "FeatureCollection",
      features: clusterRequests.filter((request) => !!request),
    },
>>>>>>> mab-open-phones-functions
  });
};
