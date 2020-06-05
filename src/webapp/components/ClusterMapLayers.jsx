/**
   Layers with popovers have to be their own component so it can manage its own state.
   If the state belongs to the same component as the Map/BasicMap, it re-renders
   the map on any state change, causing the viewport and zoom to be reset
   */
import React, { useState, useEffect } from "react";
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

const makePopupData = (features, lngLat) => {
  return features.map(feat => {
    const metaSrc = feat.properties.meta;
    const meta =
      typeof metaSrc == "string" ? JSON.parse(feat.properties.meta) : metaSrc;
    return {
      lngLat,
      meta
    };
  });
};

const ClusterMapLayers = ({ geoJsonData, paramRequest }) => {
  const [popup, setPopup] = useState();

  // display popup if request code is present in URL search param
  useEffect(() => {
    if (paramRequest) {
      const { geometry: { coordinates }} = paramRequest;
      setPopup(makePopupData([paramRequest], coordinates));
    }
  }, []);

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
              setPopup(makePopupData(e.features, e.lngLat));
            }}
            onMouseEnter={e => e.target.getCanvas().style.cursor = 'pointer'}
            onMouseLeave={e => e.target.getCanvas().style.cursor = 'grab'}
          />
          {popup && (
            <RequestPopup closePopup={() => setPopup()} requests={popup} />
          )}
        </>
      )}
    </MapContext.Consumer>
  );
};

export default ClusterMapLayers;
