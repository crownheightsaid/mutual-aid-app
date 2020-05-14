import React from "react";
import { Source } from "react-mapbox-gl";
import { LngLat } from "mapbox-gl";
import { findBounds } from "../helpers/mapbox-coordinates";
import {
  CROWN_HEIGHTS_BOUNDS,
  CROWN_HEIGHTS_CENTER_COORD
} from "../helpers/map-constants";
import BasicMap from "./BasicMap";
import { QuadrantsLayers } from "./QuadrantMap";
import ClusterMapLayers from "./ClusterMapLayers";

const makeBounds = geoJsonData => {
  const lnglats = geoJsonData.features.map(f => {
    const [lng, lat] = f.geometry.coordinates;
    return new LngLat(lng, lat);
  });

  const bounds =
    lnglats.length > 0
      ? findBounds([...CROWN_HEIGHTS_BOUNDS, ...lnglats])
      : CROWN_HEIGHTS_BOUNDS;

  return bounds;
};

const ClusterMap = ({ geoJsonData, containerStyle = {} }) => {
  if (!geoJsonData) {
    return null;
  }

  return (
    <BasicMap
      center={CROWN_HEIGHTS_CENTER_COORD}
      bounds={makeBounds(geoJsonData)}
      containerStyle={containerStyle}
    >
      <QuadrantsLayers />
      <Source
        id="clusterSource"
        geoJsonSource={{
          type: "geojson",
          data: geoJsonData,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 30
        }}
      />
      <ClusterMapLayers
        geoJsonData={geoJsonData}
      />
    </BasicMap>
  );
};

export default ClusterMap;
