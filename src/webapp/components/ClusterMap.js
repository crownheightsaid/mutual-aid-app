import React, { useState, useContext, useEffect } from "react";
import { Source } from "react-mapbox-gl";
import { LngLat } from "mapbox-gl";
import { findBounds } from "webapp/helpers/mapbox-coordinates";

import {
  CROWN_HEIGHTS_BOUNDS,
  CROWN_HEIGHTS_CENTER_COORD,
} from "../helpers/map-constants";
import BasicMap from "./BasicMap";
import { QuadrantsLayers } from "./QuadrantMap";
import ClusterMapLayers from "./ClusterMapLayers";
import { RequestNotFoundAlert, NoRequestsAlert } from "./MapAlerts";
import getRequestParam from "../helpers/getRequestParam";
import ClusterMapContext from "../context/ClusterMapContext";
import RequestPopup from "./RequestPopup";

const makeBounds = (features) => {
  const lnglats = features.map((f) => {
    const [lng, lat] = f.geometry.coordinates;
    return new LngLat(lng, lat);
  });

  const bounds =
    lnglats.length > 0
      ? findBounds([...CROWN_HEIGHTS_BOUNDS, ...lnglats])
      : CROWN_HEIGHTS_BOUNDS;

  return bounds;
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

const ClusterMap = ({ showDrivingClusters, geoJsonData, containerStyle = {} }) => {
  const [popup, setPopup] = useState();

  const requestCode = getRequestParam();
  let paramRequest;
  const { requests, drivingClusterRequests } = geoJsonData;
  const { features: reqFeatures } = requests;
  const { features: clusterFeatures } = drivingClusterRequests;
  const { focusedRequestId, setFocusedRequestId } = useContext(
    ClusterMapContext
  );

  const allRequests = showDrivingClusters
    ? [...reqFeatures, ...clusterFeatures]
    : reqFeatures;

  // current focused request can be from param or context
  const currRequestCode = requestCode || focusedRequestId;

  if (currRequestCode) {
    // find first feature with code match to be passed
    // into ClusterMapLayers
    [paramRequest] = allRequests.filter(
      ({
        properties: {
          meta: { Code },
        },
      }) => Code === currRequestCode
    );
  }

  useEffect(() => {
    if(paramRequest){
      const {
        geometry: { coordinates },
      } = paramRequest;
      setPopup(makePopupData([paramRequest], coordinates));
    }
  }, []);


  // there is a requestCode but the request object does not exist
  const paramRequestNotFound = currRequestCode && !paramRequest;
  const noRequestsFound = allRequests.length === 0;
  return (
    <>
      {paramRequestNotFound && (
        <RequestNotFoundAlert requestCode={currRequestCode} />
      )}

      {noRequestsFound && <NoRequestsAlert />}

      <BasicMap
        center={CROWN_HEIGHTS_CENTER_COORD}
        bounds={makeBounds(allRequests)}
        containerStyle={containerStyle}
      >
        <QuadrantsLayers />
        <Source
          id="requestsSource"
          geoJsonSource={{
            type: "geojson",
            data: requests,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 30,
          }}
        />
        <Source
          id="drivingClusterRequestsSource"
          geoJsonSource={{
            type: "geojson",
            data: drivingClusterRequests,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 30,
          }}
        />
        <ClusterMapLayers
          sourceId="requestsSource"
          data={reqFeatures}
          paramRequest={paramRequest}
          color="orangered"
          setPopup={setPopup}
          makePopupData={makePopupData}
        />
        {showDrivingClusters && (
          <ClusterMapLayers
            data={clusterFeatures}
            sourceId="drivingClusterRequestsSource"
            paramRequest={paramRequest}
            color="rebeccapurple"
            setPopup={setPopup}
            makePopupData={makePopupData}
          />
        )}

         {popup && (
            <RequestPopup closePopup={() => setPopup()} requests={popup} />
          )}
      </BasicMap>
    </>
  );
};

export default ClusterMap;
