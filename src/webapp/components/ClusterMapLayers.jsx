/**
   Layers with popovers have to be their own component so it can manage its own state.
   If the state belongs to the same component as the Map/BasicMap, it re-renders
   the map on any state change, causing the viewport and zoom to be reset
   */
import React, { useState } from "react";
import { Layer, MapContext } from "react-mapbox-gl";
import RequestPopup from "./RequestPopup";

const handleClusterOnClick = (map, e) => {
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
};

const ClusterMapLayers = () => {
  const [popup, setPopup] = useState();

  return (
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
                "#d03800",
                10,
                "#a22b00"
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
            onClick={e => handleClusterOnClick(map, e)}
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
              const meta = JSON.parse(e.features[0].properties.meta);
              setPopup({
                lngLat: e.lngLat,
                meta
              });
            }}
          />
          {popup && <RequestPopup data={popup} />}
        </>
      )}
    </MapContext.Consumer>
  );
};

export default ClusterMapLayers;
