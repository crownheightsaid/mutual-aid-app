/* eslint-disable max-classes-per-file */
const returnLngLat = () => ({ lng: 0, lat: 0 });

export class LngLat {
  constructor(lng, lat) {
    this.lng = lng;
    this.lat = lat;
  }
}

export class LngLatBounds {
  constructor(sw, ne) {
    this.sw = sw;
    this.ne = ne;
    this.getCenter = returnLngLat;
  }
}

export class Map {
  constructor(config) {
    this.on = jest.fn();
    this.remove = jest.fn();
    this.fitBounds = jest.fn();
    this.getCenter = returnLngLat;
    this.getZoom = () => 0;
    this.getBearing = () => 0;
    this.getPitch = () => 0;
  }
}
export default {
  //   GeolocateControl: jest.fn(),
  Map,
  LngLat,
  LngLatBounds,
  //   NavigationControl: jest.fn(),
};
