import React from "react";
import ReactMapboxGl, {
  Feature,
  Layer,
  Source,
  ZoomControl
} from "react-mapbox-gl";
import quadrantsGeoJSON from "../../assets/crownheights.json";

const CROWN_HEIGHTS_CENTER_COORD = [-73.943018, 40.671254];

const MapboxMap = ReactMapboxGl({
  accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
});

const QuadrantMap = ({ location }) => {
  return (
    <MapboxMap
      style="mapbox://styles/mapbox/bright-v9"
      center={CROWN_HEIGHTS_CENTER_COORD}
      containerStyle={{
        height: "300px",
        width: "500px"
      }}
      zoom={[12]}
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
          "fill-opacity": 0.4
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
      {location && (
        <Layer
          type="symbol"
          id="marker"
          layout={{ "icon-image": "star-15", "icon-size": 1.5 }}
        >
          <Feature coordinates={[location.lng, location.lat]} />
        </Layer>
      )}
    </MapboxMap>
  );
};

export default QuadrantMap;
