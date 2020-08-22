const axios = require("axios");
const {
  findDeliveryNeededRequests,
  findRequestByCode,
} = require("~airtable/tables/requests");
const { findVolunteerByPhone } = require("~airtable/tables/volunteers");
const { fields } = require("~airtable/tables/requests");
const { fetchCoordFromCrossStreets } = require("./fetchCoordFromCrossStreets");
const slackapi = require("~slack/webApi");

const {
  code,
  crossStreetFirst,
  crossStreetSecond,
  meta,
  neighborhoodAreaSeeMap,
  firstName,
  forDrivingClusters,
  householdSize,
} = fields;

const makeFeature = async (r) => {
  let metaJSON = {};
  let slackPermalink = {};
  let timestamp;

  const location = await fetchCoordFromCrossStreets(
    `
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

  try {
    const channel = metaJSON.slack_channel;
    timestamp = metaJSON.slack_ts;
    slackPermalink = await slackapi.chat.getPermalink({
      channel,
      message_ts: timestamp,
    });
  } catch {
    console.error(`[deliveryNeededRequestHandler] could not fetch slack URL
        for requestCode: ${r.fields[code]} channel: ${metaJSON.slack_channel} and timestamp: ${metaJSON.slack_ts}`);
  }

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

  return res.send({
    requests: {
      type: "FeatureCollection",
      features: regularRequests.filter((request) => !!request),
    },
    drivingClusterRequests: {
      type: "FeatureCollection",
      features: clusterRequests.filter((request) => !!request),
    },
  });
};

/*
 * This handler takes a delivery request code and the phone number of a delivery volunteer
 * and assigns the delivery request to that volunteer. It also pings our Twilio service which then
 * texts the delivery volunteer and intake volunteer with relevant information to initiate a
 * delivery.
 */
exports.assignDeliveryHandler = async (req, res) => {
  const { requestCode, phoneNumber } = req.body;
  if (!requestCode || !phoneNumber) {
    return res.status(400).send({
      message: "Expected `requestCode` and `phoneNumber` in payload.",
    });
  }
  let request;
  let volunteer;
  let error;

  // validate request
  try {
    [request, error] = await findRequestByCode(requestCode);
    if (error) {
      return res.status(400).send({
        message: "Expected valid `requestCode`",
      });
    }

    if (request.fields.Status !== fields.status_options.deliveryNeeded) {
      return res.status(400).send({
        message: `Cannot claim delivery ${requestCode} with status ${request.fields.Status}.`,
      });
    }
  } catch (e) {
    return res.status(400).send({ message: e });
  }

  // find volunteer record in volunteer table
  try {
    [volunteer, error] = await findVolunteerByPhone(phoneNumber);

    // TODO: on not found error, send volunteer form
    if (!volunteer || error.includes("404"))
      return res.status(404).send({
        message: error,
        notFound: "volunteer",
      });
  } catch (e) {
    return res.status(400).send({
      message: `Something went wrong while looking for volunteer record.`,
    });
  }
  
  // assign delivery to volunteer in airtable


  // TODO: ping Twilio webhook to text intake & delivery volunteers
  // try {
  //   await axios.post("http://mutual-aid-4526-dev.twil.io/delivery-sms", {
  //     requestCode,
  //     volunteer: {
  //       phoneNumber: volunteer.phoneNumber,
  //       name: volunteer.name,
  //     },
  //   });
  // } catch (e) {
  //   return res.status(400).send({
  //     message: `Something went wrong while posting to Twilio: ${e}`,
  //   });
  // }

  return res.sendStatus(200);
};
