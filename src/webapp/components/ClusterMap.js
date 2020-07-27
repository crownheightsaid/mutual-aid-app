import React, { useState } from "react";
import { Source } from "react-mapbox-gl";
import { LngLat } from "mapbox-gl";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
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

const ClusterMap = ({ geoJsonData, containerStyle = {} }) => {
  const requestCode = getRequestParam();
  const [showDrivingClusters, setShowDrivingClusters] = useState(false);

  let paramRequest;
  const { requests, drivingClusterRequests } = geoJsonData;
  const { features: reqFeatures } = requests;
  const { features: clusterFeatures } = drivingClusterRequests;
  const allRequests = showDrivingClusters
    ? [...reqFeatures, ...clusterFeatures]
    : reqFeatures;

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

      <FormControlLabel
        control={
          <Checkbox
            checked={showDrivingClusters}
            onClick={() => setShowDrivingClusters(!showDrivingClusters)}
          />
        }
        label="Show driving clusters"
      />
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
          paramRequest={paramRequest}
          color="orangered"
        />
        {showDrivingClusters && (
          <ClusterMapLayers
            sourceId="drivingClusterRequestsSource"
            paramRequest={paramRequest}
            color="rebeccapurple"
          />
        )}
      </BasicMap>
    </>
  );
};

export default ClusterMap;
