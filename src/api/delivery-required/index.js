const { Client } = require("@googlemaps/google-maps-services-js");
const { findDeliveryNeededRequests } = require("~airtable/tables/requests");
const { fields } = require("~airtable/tables/requests");

const fetchCoord = async (googleGeoClient, address) => {
  const geoResult = await googleGeoClient.geocode({
    params: {
      address,
      region: "us",
      components: {
        locality: "New York City"
      },
      key: process.env.GOOGLE_MAPS_API_KEY
    },
    timeout: 1000 // milliseconds
  });

  const [locResult, ..._rest] = geoResult.data.results;
  const {
    geometry: { location }
  } = locResult;

  return location;
};
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

  const googleGeoClient = new Client({});

  const requestsWithCoordsPromises = requestObj.map(async r => {
    let metaJSON = {};
    let slackChannelId;
    const location = await fetchCoord(
      googleGeoClient,
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
      [code]: r.fields[code],
      [crossStreetFirst]: r.fields[crossStreetFirst],
      [crossStreetSecond]: r.fields[crossStreetSecond],
      [neighborhoodAreaSeeMap]: r.fields[neighborhoodAreaSeeMap],
      slackChannelId,
      location
    };
  });

  const requestsClean = await Promise.all(requestsWithCoordsPromises);
  return res.send(requestsClean);
};
