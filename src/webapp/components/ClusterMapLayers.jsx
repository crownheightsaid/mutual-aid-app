/**
   Layers with popovers have to be their own component so it can manage its own state.
   If the state belongs to the same component as the Map/BasicMap, it re-renders
   the map on any state change, causing the viewport and zoom to be reset
   */
import React, { useState, useEffect, useContext } from "react";
import { Layer, MapContext } from "react-mapbox-gl";
import RequestPopup from "./RequestPopup";
import ClusterMapContext from "../context/ClusterMapContext";

const handleClusterOnClick = (map, e, layerId, sourceId) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: [layerId],
  });
  const clusterId = features[0].properties.cluster_id;

  map.getSource(sourceId).getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return;

    map.easeTo({
      center: features[0].geometry.coordinates,
      zoom,
    });
  });
};

const makePopupData = (features, lngLat) => {
  return features.map((feat) => {
    const metaSrc = feat.properties.meta;
    const meta =
      typeof metaSrc == "string" ? JSON.parse(feat.properties.meta) : metaSrc;
    return {
      lngLat,
      meta,
    };
  });
};

const ClusterMapLayers = ({ data, paramRequest, sourceId, color }) => {
  const [popup, setPopup] = useState();
  const [initialRender, setInitialRender] = useState(true);
  const { focusedRequestId, setFocusedRequestId } = useContext(
    ClusterMapContext
  );

  const setCursorPointer = (e) => {
    e.target.getCanvas().style.cursor = "pointer";
  };
  const setCursorGrab = (e) => {
    e.target.getCanvas().style.cursor = "grab";
  };

  useEffect(() => {
    // display popup if request code is present in URL search param
    // but only on first render
    if (paramRequest && initialRender) {
      setPopup(
        makePopupData([paramRequest], paramRequest.geometry.coordinates)
      );
      setInitialRender(false);
    }

    // find focused request and display popup
    const [focusedRequest] = data.filter(
      ({
        properties: {
          meta: { Code },
        },
      }) => Code === focusedRequestId
    );
    if (focusedRequest) {
      setPopup(
        makePopupData([focusedRequest], focusedRequest.geometry.coordinates)
      );
    }
  }, [focusedRequestId]);

  const layerId = `${sourceId}-clusters`;

  return (
    <MapContext.Consumer>
      {(map) => (
        <>
          <Layer
            sourceId={sourceId}
            type="circle"
            id={layerId}
            filter={["has", "point_count"]}
            paint={{
              "circle-color": "#656567", // A dark gray
              "circle-radius": [
                "step",
                ["get", "point_count"],
                20,
                5,
                30,
                20,
                40,
              ],
            }}
            onClick={(e) => handleClusterOnClick(map, e, layerId, sourceId)}
            onMouseEnter={setCursorPointer}
            onMouseLeave={setCursorGrab}
          />

          <Layer
            id={`${sourceId}-cluster-count`}
            type="symbol"
            sourceId={sourceId}
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-font": ["Arial Unicode MS Bold"],
              "text-size": 14,
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />

          <Layer
            id={`${sourceId}-unclustered-point`}
            type="circle"
            sourceId={sourceId}
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": ["get", "markerColor"],
              "circle-stroke-color": "#656567", // A dark gray
              "circle-stroke-width": 2,
            }}
            onClick={(e) => {
              setPopup(makePopupData(e.features, e.lngLat));

              // only support setting context for one focused request for now
              if (e.features.length === 1) {
                const request = e.features[0];
                if (request) {
                  setFocusedRequestId(request.properties.title);
                }
              }
            }}
            onMouseEnter={setCursorPointer}
            onMouseLeave={setCursorGrab}
          />
          {popup && (
            <RequestPopup
              closePopup={() => setPopup()}
              focusedRequestId={focusedRequestId}
              requests={popup}
            />
          )}
        </>
      )}
    </MapContext.Consumer>
  );
};

export default ClusterMapLayers;
