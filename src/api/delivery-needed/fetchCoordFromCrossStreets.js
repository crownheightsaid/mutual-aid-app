const { Client } = require("@googlemaps/google-maps-services-js");
const { makeCache } = require("../../lib/cache/makeCache");

let googleGeoClient;
let cache;

// cache lookups for 7 days (miliseconds)
const CACHE_AGE = 7 * 24 * 60 * 60 * 1000;

const makeCacheKey = address => {
  return `geoCache-${address}`;
};

exports.fetchCoordFromCrossStreets = async address => {
  googleGeoClient = googleGeoClient || new Client({});
  cache = cache || makeCache({ maxAge: CACHE_AGE });

  let geoResult;
  const cacheKey = makeCacheKey(address);

  // look in cache
  if (cache.peek(cacheKey)) {
    geoResult = cache.get(cacheKey);
    console.log("cache hit");
  } else {
    console.log("cache miss");
    // if not found, fetch from Google and cache
    geoResult = await googleGeoClient.geocode({
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

    cache.set(cacheKey, geoResult);
  }

  // use first result
  const [first, ..._rest] = geoResult.data.results;
  const {
    geometry: { location }
  } = first;
  return location;
};
