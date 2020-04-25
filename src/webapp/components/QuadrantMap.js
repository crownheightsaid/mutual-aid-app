import React from "react";
import ReactMapboxGl, {
  Feature,
  Layer,
  Source,
  ZoomControl
} from "react-mapbox-gl";
import { LngLat, LngLatBounds } from "mapbox-gl";
import { useTranslation } from "react-i18next";
import quadrantsGeoJSON from "../../lib/assets/crownheights.json";
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

const CROWN_HEIGHTS_CENTER_COORD = new LngLatBounds(
  CROWN_HEIGHTS_BOUNDS[0],
  CROWN_HEIGHTS_BOUNDS[1]
).getCenter();
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MissingMap = () => {
  const { t: str } = useTranslation();
  return (
    <div>
      {str("webapp:zoneFinder.map.error")}
      &nbsp;
      <a href={str("webapp:slack.techChannelUrl")}>
        {str("webapp:slack.techChannel")}
      </a>
    </div>
  );
};

const MapboxMap = MAPBOX_TOKEN
  ? ReactMapboxGl({
      accessToken: MAPBOX_TOKEN
    })
  : MissingMap;

const QuadrantMap = ({ location }) => {
  const lnglat = location && new LngLat(location.lng, location.lat);
  const bounds = lnglat
    ? findBounds([...CROWN_HEIGHTS_BOUNDS, lnglat])
    : CROWN_HEIGHTS_BOUNDS;

  return (
    <MapboxMap // eslint-disable-next-line react/style-prop-object
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
