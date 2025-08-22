import type { Map, Marker, LatLng } from "leaflet";

export const isMarkerDisplayed = (marker: Marker): boolean => {
  // Leaflet sets _icon when a marker is actually on the map (not clustered)
  return Boolean((marker as unknown as { _icon?: HTMLElement })._icon);
};

export const nearlySameView = (map: Map, latlng: LatLng, zoom: number): boolean => {
  const dz = Math.abs(zoom - map.getZoom());
  const d = map.getCenter().distanceTo(latlng);
  return dz < 0.5 && d < 2; // within ~2m and 0.5 zoom level
};