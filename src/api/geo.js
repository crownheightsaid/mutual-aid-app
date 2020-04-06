const { Client } = require("@googlemaps/google-maps-services-js");
const gju = require("geojson-utils");
const Geonames = require("geonames.js");
const boundsJson = require("../assets/crownheights.json");

const googleGeoClient = new Client({});
const geonamesClient = new Geonames({
  username: process.env.GEONAME_CLIENT_ID || "demo",
  lan: "en",
  encoding: "JSON"
});

exports.addressHandler = async (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  if (!req.body.address) {
    return next("Must include 'address' in POST request.");
  }
  try {
    const geoResult = await googleGeoClient.geocode({
      params: {
        address: req.body.address,
        region: "us",
        components: {
          locality: "New York City"
        },
        key: process.env.GOOGLE_MAPS_API_KEY
      },
      timeout: 1000 // milliseconds
    });
    const geoResults = geoResult.data.results;

    const locResult = geoResults[0];
    const {
      geometry: { location }
    } = locResult;

    const neighborhood = locResult.address_components.find(component =>
      component.types.includes("neighborhood")
    );

    const neighborhoodName = neighborhood ? neighborhood.long_name : "";

    const [lt, long] = [location.lat, location.lng];

    const intersection = await geonamesClient.findNearestIntersection({
      lat: lt,
      lng: long
    });
    const userQuadrant = boundsJson.features.find(quadrant =>
      gju.pointInPolygon(
        { type: "Point", coordinates: [long, lt] },
        quadrant.geometry
      )
    );
    const quadrantName = userQuadrant ? userQuadrant.properties.id : null;

    return res.end(
      JSON.stringify({
        neighborhoodName,
        location,
        intersection: {
          street_1: intersection.intersection.street1,
          street_2: intersection.intersection.street2
        },
        quadrant: quadrantName
      })
    );
  } catch (err) {
    console.log(err);
    return next("Address couldn't be found");
  }
};
