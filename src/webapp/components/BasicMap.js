// Reusable Mapbox map component

import React from "react";
import ReactMapboxGl, { ZoomControl } from "react-mapbox-gl";
import MissingMap from "./MissingMap";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapboxMap = MAPBOX_TOKEN
  ? ReactMapboxGl({
      accessToken: MAPBOX_TOKEN,
    })
  : MissingMap;

const BasicMap = ({ center, bounds, containerStyle, children }) => (
  <MapboxMap // eslint-disable-next-line react/style-prop-object
    style="mapbox://styles/mapbox/bright-v9"
    center={center}
    containerStyle={{
      height: "350px",
      width: "100%",
      ...containerStyle,
    }}
    fitBounds={bounds}
    fitBoundsOptions={{
      padding: {
        top: 24,
        right: 24,
        bottom: 24,
        left: 24,
      },
    }}
  >
    <ZoomControl />

    {children}
  </MapboxMap>
);

export default BasicMap;
