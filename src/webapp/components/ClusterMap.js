import React from "react";
import { Source } from "react-mapbox-gl";
import { LngLat } from "mapbox-gl";
import { findBounds } from "webapp/helpers/mapbox-coordinates";

import { getUrgencyStyles } from "webapp/helpers/map-urgency";
import {
  CROWN_HEIGHTS_BOUNDS,
  CROWN_HEIGHTS_CENTER_COORD,
} from "../helpers/map-constants";
import BasicMap from "./BasicMap";
import { QuadrantsLayers } from "./QuadrantMap";
import ClusterMapLayers from "./ClusterMapLayers";
import { RequestNotFoundAlert, NoRequestsAlert } from "./MapAlerts";
import { getDaysSinceIsoTimestamp } from "../helpers/time";
import getParam from "../helpers/utils";

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

const addDaysOpen = (feature) => {
  const styles = getUrgencyStyles(
    getDaysSinceIsoTimestamp(
      feature.properties.meta.dateChangedToDeliveryNeeded
    )
  );
  const markerColor = styles.backgroundColor;
  return {
    ...feature,
    properties: {
      ...feature.properties,
      markerColor,
    },
  };
};

const ClusterMap = ({
  showDrivingRequests,
  showRegularRequests,
  geoJsonData,
  containerStyle = {},
}) => {
  const requestCode = getParam("request");

  let paramRequest;
  const { requests, drivingClusterRequests } = geoJsonData;
  requests.features = requests.features.map(addDaysOpen);
  drivingClusterRequests.features = drivingClusterRequests.features.map(
    addDaysOpen
  );

  const { features: reqFeatures } = requests;
  const { features: clusterFeatures } = drivingClusterRequests;

  let allRequests = [];

  if (showDrivingRequests) {
    allRequests = [...allRequests, ...clusterFeatures];
  }
  if (showRegularRequests) {
    allRequests = [...allRequests, ...reqFeatures];
  }

  if (requestCode) {
    // find first feature with code match to be passed
    // into ClusterMapLayers
    [paramRequest] = allRequests.filter(
      ({
        properties: {
          meta: { Code },
        },
      }) => Code === requestCode
    );
  }

  // there is a requestCode but the request object does not exist
  const paramRequestNotFound = requestCode && !paramRequest;
  const noRequestsFound = allRequests.length === 0;
  return (
    <>
      {paramRequestNotFound && (
        <RequestNotFoundAlert requestCode={requestCode} />
      )}

      {noRequestsFound && <NoRequestsAlert />}

      <BasicMap
        center={CROWN_HEIGHTS_CENTER_COORD}
        bounds={makeBounds(allRequests)}
        containerStyle={containerStyle}
        lockZoomUnlessBoundsChange
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
        {showRegularRequests && (
          <ClusterMapLayers
            sourceId="requestsSource"
            paramRequest={paramRequest}
            color="orangered"
            data={reqFeatures}
          />
        )}
        {showDrivingRequests && (
          <ClusterMapLayers
            sourceId="drivingClusterRequestsSource"
            paramRequest={paramRequest}
            color="rebeccapurple"
            data={clusterFeatures}
          />
        )}
      </BasicMap>
    </>
  );
};

export default ClusterMap;
