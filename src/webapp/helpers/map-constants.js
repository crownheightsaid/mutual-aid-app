import { LngLat, LngLatBounds } from "mapbox-gl";
import quadrantsGeoJSON from "lib/assets/crownheights.json";
import { findBounds } from "./mapbox-coordinates";

// get all coords in quadrantsGeoJSON to find bounds
const CROWN_HEIGHTS_BOUNDS = findBounds(
  quadrantsGeoJSON.features.reduce((acc, f) => {
    const lnglats = f.geometry.coordinates[0].map(
      (coord) => new LngLat(coord[0], coord[1])
    );
    return acc.concat(lnglats);
  }, [])
);

const CROWN_HEIGHTS_CENTER_COORD = new LngLatBounds(
  CROWN_HEIGHTS_BOUNDS[0],
  CROWN_HEIGHTS_BOUNDS[1]
).getCenter();

export { CROWN_HEIGHTS_BOUNDS, CROWN_HEIGHTS_CENTER_COORD };
