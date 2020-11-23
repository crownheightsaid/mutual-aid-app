const _ = require("lodash");
const axios = require("axios");
const {
  findDeliveryNeededRequests,
  findRequestByCode,
} = require("~airtable/tables/requests");
const {
  findVolunteerByPhone,
  findVolunteerById,
} = require("~airtable/tables/volunteers");
const { volunteersFields } = require("~airtable/tables/volunteersSchema");
const { fields } = require("~airtable/tables/requestsSchema");
const { fetchCoordFromCrossStreets } = require("./fetchCoordFromCrossStreets");
const slackapi = require("~slack/webApi");
const { updateRequestByCode } = require("~airtable/tables/requests");
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
  status,
  deliveryVolunteer,
  // eslint-disable-next-line camelcase
  status_options,
  intakeVolunteer,
  timeSensitivity,
  intakeNotes,
  supportType,
  dateChangedToDeliveryNeeded,
} = fields;

const { TWILIO_SMS_DELIVERY_ENDPOINT } = process.env;

const makeFeature = async (r) => {
  let metaJSON = {};
  let slackPermalink = {};

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
    const timestamp = metaJSON.slack_ts;
    slackPermalink = await slackapi.chat.getPermalink({
      channel,
      message_ts: timestamp,
    });
  } catch {
    console.error(`[deliveryNeededRequestHandler] could not fetch slack URL
        for requestCode: ${r.fields[code]} channel: ${metaJSON.slack_channel} and timestamp: ${metaJSON.slack_ts}`);
  }

  const need = getDeliveryRequestNeedFormatted(r.fields[supportType], r.fields);

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
        slackPermalink: slackPermalink.permalink || "",
        dateChangedToDeliveryNeeded: r.fields[dateChangedToDeliveryNeeded],
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

  const [clusterRequestsPromises, regularRequestsPromises] = _.partition(
    requestObj,
    (r) => r.fields[forDrivingClusters]
  ).map((promises) => promises.map(makeFeature));

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
 * and assigns the volunteer to the delivery request. It also pings our Twilio service which then
 * texts the delivery and intake volunteers with relevant information to initiate a
 * delivery.
 */
exports.assignDeliveryHandler = async (req, res) => {
  const { requestCode, phoneNumber } = req.body;

  if (!requestCode || !phoneNumber)
    return res.status(400).send({
      message: "Expected `requestCode` and `phoneNumber` in request body.",
    });

  let request;
  let deliveryVol;
  let intakeVol;
  let error;

  // validate request
  try {
    [request, error] = await findRequestByCode(requestCode);
    if (error)
      return res.status(404).send({
        message: `${requestCode} not found.`,
      });

    if (request.fields.Status !== status_options.deliveryNeeded)
      return res.status(400).send({
        message: `Cannot claim delivery ${requestCode} with status "${request.fields.Status}".`,
      });

    if (
      !request.fields[intakeVolunteer] ||
      request.fields[intakeVolunteer].length === 0
    )
      return res.status(400).send({
        message: `Cannot claim delivery ${requestCode} because there is no intake volunteer assigned. Please follow up with #intake_volunteers on Slack - we'll get it sorted out.`,
      });
  } catch (e) {
    return res.status(400).send({ message: e });
  }

  // find volunteer records in volunteer table
  try {
    // delivery volunteer
    [deliveryVol, error] = await findVolunteerByPhone(phoneNumber);

    // TODO: on not found error, send volunteer form
    if (!deliveryVol || (error && error.includes("404")))
      return res.status(404).send({
        message: error,
      });
    if (error) throw new Error(error);

    // intake volunteer
    [intakeVol, error] = await findVolunteerById(
      request.fields[intakeVolunteer][0]
    );

    if (!intakeVol.fields[volunteersFields.phone])
      error = `Cannot claim delivery ${requestCode} because the assigned intake volunteer has not provided their phone number. Please follow up with #intake_volunteers on Slack - we'll get it sorted out.`;

    if (!intakeVol || (error && error.includes("404")))
      return res.status(404).send({
        message: error,
      });
    if (error) throw new Error(error);
  } catch (e) {
    return res.status(400).send({
      message: `Something went wrong while looking for volunteer record: ${e}`,
    });
  }

  try {
    const {
      [volunteersFields.phone]: deliveryPhone,
      volunteer_name: deliveryName,
    } = deliveryVol.fields;
    const {
      [volunteersFields.phone]: intakePhone,
      volunteer_name: intakeName,
    } = intakeVol.fields;
    await axios.post(TWILIO_SMS_DELIVERY_ENDPOINT, {
      body: {
        requestCode,
        deliveryPhone,
        deliveryName, // delivery volunteer name
        intakePhone,
        intakeName,
      },
    });
  } catch (e) {
    return res.status(400).send({
      message: `Something went wrong while posting to Twilio: ${e}`,
    });
  }

  // assign delivery volunteer to request
  try {
    // use email username in place of an empty volunteer name field
    // return empty string if neither exist
    const {
      [volunteersFields.name]: volunteerName,
      [volunteersFields.email]: volunteerEmail,
    } = deliveryVol.fields;
    const name =
      volunteerName || (volunteerEmail && volunteerEmail.split("@")[0]) || "";

    // assign delivery to volunteer in airtable
    [request, error] = await updateRequestByCode(requestCode, {
      [status]: status_options.deliveryAssigned,
      [deliveryVolunteer]: name,
    });

    if (error) throw new Error(error);
  } catch (e) {
    return res.status(400).send({
      message: `Something went wrong while updating the request record ${requestCode}: ${e}`,
    });
  }

  return res.sendStatus(200);
};
