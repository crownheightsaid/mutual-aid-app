import React from "react";
import { Layer, Source, MapContext } from "react-mapbox-gl";
import { LngLat } from "mapbox-gl";
import { findBounds } from "../helpers/mapbox-coordinates";
import {
  CROWN_HEIGHTS_BOUNDS,
  CROWN_HEIGHTS_CENTER_COORD
} from "../helpers/map-constants";
import BasicMap from "./BasicMap";
import { QuadrantsLayers } from "./QuadrantMap";

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
      <MapContext.Consumer>
        {map => (
          <>
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

            <Layer
              sourceId="clusterSource"
              type="circle"
              id="clusters"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "#51bbd6",
                  5,
                  "#f1f075",
                  20,
                  "#f28cb1"
                ],
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  20,
                  5,
                  30,
                  20,
                  40
                ]
              }}
              onClick={e => {
                const features = map.queryRenderedFeatures(e.point, {
                  layers: ["clusters"]
                });
                const clusterId = features[0].properties.cluster_id;
                map
                  .getSource("clusterSource")
                  .getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                      center: features[0].geometry.coordinates,
                      zoom
                    });
                  });
              }}
            />

            <Layer
              id="cluster-count"
              type="symbol"
              sourceId="clusterSource"
              filter={["has", "point_count"]}
              layout={{
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12
              }}
            />

            <Layer
              id="unclustered-point"
              type="circle"
              sourceId="clusterSource"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-color": "#000",
                "circle-radius": 4,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
              }}
              onClick={(_, event) => {
                window.alert("hello");
              }}
            />
          </>
        )}
      </MapContext.Consumer>
    </BasicMap>
  );
};

export default ClusterMap;
