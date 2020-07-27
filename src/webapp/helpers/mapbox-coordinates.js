import { LngLat } from "mapbox-gl";

const isValidLngLat = (c) => c instanceof LngLat;

const findBounds = (rawCoords) => {
  const coords = rawCoords.filter((c) => isValidLngLat(c));
  // find min and max lng
  const minLng = Math.min(...coords.map((c) => c.lng));
  const maxLng = Math.max(...coords.map((c) => c.lng));

  // find min and max lat
  const minLat = Math.min(...coords.map((c) => c.lat));
  const maxLat = Math.max(...coords.map((c) => c.lat));

  return [new LngLat(minLng, minLat), new LngLat(maxLng, maxLat)];
};

export { isValidLngLat, findBounds };
