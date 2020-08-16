// Reusable Mapbox map component

import React, { useState, useEffect } from "react";
import ReactMapboxGl, { ZoomControl } from "react-mapbox-gl";
import MissingMap from "./MissingMap";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapboxMap = MAPBOX_TOKEN
  ? ReactMapboxGl({
      accessToken: MAPBOX_TOKEN,
    })
  : MissingMap;

const BasicMap = ({
  center,
  bounds,
  containerStyle,
  children,
  lockZoomUnlessBoundsChange,
}) => {
  const [currBounds, setCurrBounds] = useState([]);
  const [zoom, setZoom] = useState(13);
  /**
    To prevent map from zooming in and out during any state
    changes of child components,
    only update zoom if bounds has changed. bounds may
    change due to delivery or regular requests hidden or shown
    */
  let boundsProps = {};
  let boundsChanged = false;
  if (lockZoomUnlessBoundsChange) {
    if (!currBounds) {
      boundsChanged = true;
    } else if (JSON.stringify(currBounds) !== JSON.stringify(bounds)) {
      // since bounds is a small object, ok to use this hacky way to check equality
      boundsChanged = true;
    }

    boundsProps = {
      zoom: [zoom],
      onZoomEnd: (map) => {
        setZoom(map.getZoom());
      },
    };

    if (boundsChanged) {
      boundsProps = {
        ...boundsProps,
        fitBounds: bounds,
        fitBoundsOptions: {
          padding: {
            top: 24,
            right: 24,
            bottom: 24,
            left: 24,
          },
        },
      };
    }
  } else {
    boundsProps = {
      fitBounds: bounds,
      fitBoundsOptions: {
        padding: {
          top: 24,
          right: 24,
          bottom: 24,
          left: 24,
        },
      },
    };
  }

  useEffect(() => {
    if (lockZoomUnlessBoundsChange && boundsChanged) {
      setCurrBounds(bounds);
    }
  }, [lockZoomUnlessBoundsChange, boundsChanged, bounds]);

  return (
    <MapboxMap // eslint-disable-next-line react/style-prop-object
      style="mapbox://styles/mapbox/bright-v9"
      center={center}
      containerStyle={{
        height: "350px",
        width: "100%",
        ...containerStyle,
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...boundsProps}
    >
      <ZoomControl />

      {children}
    </MapboxMap>
  );
};

export default BasicMap;
