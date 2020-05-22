/**
   Layers with popovers have to be their own component so it can manage its own state.
   If the state belongs to the same component as the Map/BasicMap, it re-renders
   the map on any state change, causing the viewport and zoom to be reset
   */
import React, { useState, useEffect } from "react";
import { Layer, MapContext } from "react-mapbox-gl";
import RequestPopup from "./RequestPopup";

const handleClusterOnClick = (map, e, layerId, sourceId) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: [layerId]
  });
  const clusterId = features[0].properties.cluster_id;
  map.getSource(sourceId).getClusterExpansionZoom(clusterId, (err, zoom) => {
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

const ClusterMapLayers = ({ geoJsonData, paramRequest, sourceId, color }) => {
  const [popup, setPopup] = useState();

  // display popup if request code is present in URL search param
  useEffect(() => {
    if (paramRequest) {
      const {
        geometry: { coordinates }
      } = paramRequest;
      setPopup(makePopupData([paramRequest], coordinates));
    }
  }, []);

  const layerId = `${sourceId}-clusters`;

  return (
    <MapContext.Consumer>
      {map => (
        <>
          <Layer
            sourceId={sourceId}
            type="circle"
            id={layerId}
            filter={["has", "point_count"]}
            paint={{
              "circle-color": [
                "step",
                ["get", "point_count"],
                color,
                5,
                color,
                10,
                color
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
            onClick={e => handleClusterOnClick(map, e, layerId, sourceId)}
          />

          <Layer
            id={`${sourceId}-cluster-count`}
            type="symbol"
            sourceId={sourceId}
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
            id={`${sourceId}-unclustered-point`}
            type="circle"
            sourceId={sourceId}
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": color,
              "circle-radius": 6
            }}
            onClick={e => {
              setPopup(makePopupData(e.features, e.lngLat));
            }}
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
