import React from "react";
import ReactMapboxGl, {
  Feature,
  Layer,
  Source,
  ZoomControl
} from "react-mapbox-gl";
import { LngLat } from "mapbox-gl";
import quadrantsGeoJSON from "../../assets/crownheights.json";
import { findBounds } from "../helpers/mapbox-coordinates";

// get all coords in quadrantsGeoJSON to find bounds
const CROWN_HEIGHTS_BOUNDS = findBounds(
  quadrantsGeoJSON.features.reduce((acc, f) => {
    const lnglats = f.geometry.coordinates[0].map(
      coord => new LngLat(coord[0], coord[1])
    );
    return acc.concat(lnglats);
  }, [])
);

const CROWN_HEIGHTS_CENTER_COORD = new LngLat(-73.943018, 40.671254);
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapboxMap = MAPBOX_TOKEN
  ? ReactMapboxGl({
      accessToken: MAPBOX_TOKEN
    })
  : () => (
    <div>
        Mapbox token is missing. This means that the map cannot be displayed,
        but should not affect the functionality of the page. Please inform
        <a href="https://crownheightsmutualaid.slack.com/archives/C010AUQ6DFD">
          #tech.
      </a>
      </div>
    );

const QuadrantMap = ({ location }) => {
  const lnglat = location && new LngLat(location.lng, location.lat);
  const bounds = lnglat
    ? findBounds([...CROWN_HEIGHTS_BOUNDS, lnglat])
    : CROWN_HEIGHTS_BOUNDS;

  return (
    <MapboxMap
      style="mapbox://styles/mapbox/bright-v9"
      center={CROWN_HEIGHTS_CENTER_COORD}
      containerStyle={{
        height: "350px",
        width: "100%"
      }}
      fitBounds={bounds}
      fitBoundsOptions={{
        padding: {
          top: 24,
          right: 24,
          bottom: 24,
          left: 24
        }
      }}
    >
      <ZoomControl />

      {/* load geojson source */}
      <Source
        id="quadrants_src"
        geoJsonSource={{
          type: "geojson",
          data: quadrantsGeoJSON
        }}
      />

      {/* fill quadrants */}
      <Layer
        sourceId="quadrants_src"
        type="fill"
        paint={{
          "fill-color": {
            type: "identity",
            property: "fill"
          },
          "fill-opacity": 0.25
        }}
      />

      {/* label quadrants */}
      <Layer
        sourceId="quadrants_src"
        type="symbol"
        layout={{
          "text-field": {
            type: "identity",
            property: "id"
          },
          "text-size": 20
        }}
      />

      {/* display marker for current address if exists */}
      {lnglat && (
        <Layer
          type="symbol"
          id="marker"
          layout={{ "icon-image": "star-15", "icon-size": 1.5 }}
        >
          <Feature coordinates={[lnglat.lng, lnglat.lat]} />
        </Layer>
      )}
    </MapboxMap>
  );
};

export default QuadrantMap;
