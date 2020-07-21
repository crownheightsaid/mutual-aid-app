import React from "react";
import { Feature, Layer, Source } from "react-mapbox-gl";
import { LngLat } from "mapbox-gl";
import quadrantsGeoJSON from "../../lib/assets/crownheights.json";
import { findBounds } from "../helpers/mapbox-coordinates";
import BasicMap from "./BasicMap";
import {
  CROWN_HEIGHTS_BOUNDS,
  CROWN_HEIGHTS_CENTER_COORD
} from "../helpers/map-constants";

const QuadrantsLayers = () => {
  return (
    <>
      {/* load geojson source */}
      <Source
        id="quadrants_src"
        geoJsonSource={{
          type: "geojson",
          data: quadrantsGeoJSON
        }}
      />

      {/* fill quadrants */}
      <Layer
        sourceId="quadrants_src"
        type="fill"
        paint={{
          "fill-color": {
            type: "identity",
            property: "fill"
          },
          "fill-opacity": 0.25
        }}
      />

      {/* label quadrants */}
      <Layer
        sourceId="quadrants_src"
        type="symbol"
        layout={{
          "text-field": {
            type: "identity",
            property: "id"
          },
          "text-size": 20
        }}
      />
    </>
  );
};

const QuadrantMap = ({ locations = [], containerStyle = {} }) => {
  const lnglats = locations.map(
    location => new LngLat(location.lng, location.lat)
  );
  const bounds =
    lnglats.length > 0
      ? findBounds([...CROWN_HEIGHTS_BOUNDS, ...lnglats])
      : CROWN_HEIGHTS_BOUNDS;

  return (
    <BasicMap
      center={CROWN_HEIGHTS_CENTER_COORD}
      bounds={bounds}
      containerStyle={containerStyle}
    >
      <QuadrantsLayers />
      {/* display marker for current address if exists */}
      {lnglats.map(({ lng, lat, code }, i) => {
        return (
          <Layer
            key={code}
            type="symbol"
            id={`marker-${i}`}
            layout={{ "icon-image": "star-15", "icon-size": 1.5 }}
          >
            <Feature coordinates={[lng, lat]} />
          </Layer>
        );
      })}
    </BasicMap>
  );
};

export default QuadrantMap;
export { QuadrantsLayers };
