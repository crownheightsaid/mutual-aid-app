import React, { useState } from "react";
import { Layer, Source, MapContext, Popup } from "react-mapbox-gl";
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
  const [popup, setPopup] = useState();

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
      <MapContext.Consumer>
        {map => (
          <>
            <Layer
              sourceId="clusterSource"
              type="circle"
              id="clusters"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "orangered",
                  5,
                  "orangered",
                  20,
                  "orangered"
                ],
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  20,
                  5,
                  30,
                  20,
                  40
                ],
                "circle-stroke-width": 1,
                "circle-stroke-color": "#e73e00"
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
                "text-font": ["Arial Unicode MS Bold"],
                "text-size": 14
              }}
              paint={{
                "text-color": "#ffffff"
              }}
            />

            <Layer
              id="unclustered-point"
              type="circle"
              sourceId="clusterSource"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-color": "orangered",
                "circle-radius": 6,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#e73e00"
              }}
              onClick={e => {
                setPopup({
                  lngLat: e.lngLat,
                  meta: e.features[0].properties.meta
                });
              }}
            />
          </>
        )}
      </MapContext.Consumer>

      {popup && (
        <Popup
          coordinates={popup.lngLat}
          offset={{
            "bottom-left": [12, -38],
            bottom: [0, -38],
            "bottom-right": [-12, -38]
          }}
        >
          {popup.meta}
        </Popup>
      )}
    </BasicMap>
  );
};

export default ClusterMap;
