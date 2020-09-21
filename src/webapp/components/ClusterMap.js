import React from "react";
import { Source } from "react-mapbox-gl";
import { LngLat } from "mapbox-gl";
import { findBounds } from "webapp/helpers/mapbox-coordinates";

import {
  CROWN_HEIGHTS_BOUNDS,
  CROWN_HEIGHTS_CENTER_COORD
} from "../helpers/map-constants";
import BasicMap from "./BasicMap";
import { QuadrantsLayers } from "./QuadrantMap";
import ClusterMapLayers from "./ClusterMapLayers";
import { RequestNotFoundAlert, NoRequestsAlert } from "./MapAlerts";
import getRequestParam from "../helpers/getRequestParam";

<<<<<<< HEAD
const makeBounds = geoJsonData => {
  const lnglats = geoJsonData.features.map(f => {
=======
const makeBounds = (features) => {
  const lnglats = features.map((f) => {
>>>>>>> mab-open-phones-functions
    const [lng, lat] = f.geometry.coordinates;
    return new LngLat(lng, lat);
  });

  const bounds =
    lnglats.length > 0
      ? findBounds([...CROWN_HEIGHTS_BOUNDS, ...lnglats])
      : CROWN_HEIGHTS_BOUNDS;

  return bounds;
};

<<<<<<< HEAD
<<<<<<< HEAD
const getRequestParam = () => {
  const searchStr = window.location && window.location.search;
  return searchStr
    .slice(1)
    .split("&")
    .reduce((acc, token) => {
      const matches = token.match(/request=(.*)/);
      return matches ? matches[1] : acc;
    }, "");
};

// Alert to show when a request from URL param does not exist
const RequestNotFoundAlert = ({ requestCode }) => {
  const { t: str } = useTranslation();
  return (
    <Alert severity="warning">
      {`${str("webapp:deliveryNeeded.requestNotFound.message", {
        defaultValue: `Request with code {{requestCode}} is not found. This means that the request is no longer in 'Delivery Needed' status.`,
        requestCode
      })} `}
      <a
        href={str("webapp:deliveryNeeded.requestNotFound.redirectLink", {
          defaultValue: "/delivery-needed"
        })}
      >
        {str("webapp:deliveryNeeded.requestNotFound.redirectMessage", {
          defaultValue: `See all requests instead.`
        })}
      </a>
    </Alert>
  );
};

const NoRequestsAlert = () => {
  const { t: str } = useTranslation();
  return (
    <Alert severity="warning">
      {str("webapp:deliveryNeeded.noRequests.message", {
        defaultValue:
          "No requests found. Some requests may not have been posted in Slack yet or be marked for driving clusters."
      })}
    </Alert>
  );
};

=======
>>>>>>> mab-open-phones-functions
const ClusterMap = ({ geoJsonData, containerStyle = {} }) => {
=======
const ClusterMap = ({
  showDrivingRequests,
  showRegularRequests,
  geoJsonData,
  containerStyle = {},
}) => {
>>>>>>> upstream/master
  const requestCode = getRequestParam();

  let paramRequest;
  const { requests, drivingClusterRequests } = geoJsonData;
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
          meta: { Code }
        }
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
            clusterRadius: 30
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
