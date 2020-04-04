import React from "react";
import ReactMapboxGl, { Feature, Layer, Source } from "react-mapbox-gl";
import quadrantsGeoJSON from "../../assets/crownheights.json";

const CROWN_HEIGHTS_CENTER_COORD = [-73.943018, 40.671254];

const MapboxMap = ReactMapboxGl({
  accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
});

const QuadrantMap = ({ location }) => {
  return (
    <MapboxMap
      style="mapbox://styles/mapbox/streets-v9"
      center={CROWN_HEIGHTS_CENTER_COORD}
      containerStyle={{
        height: "300px",
        width: "500px"
      }}
      zoom={[12]}
    >
      <Source
        id="quadrants_src"
        geoJsonSource={{
          type: "geojson",
          data: quadrantsGeoJSON
        }}
      />

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
