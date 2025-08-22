// Ensure tsconfig.json includes: "src/types/**/*.d.ts" in "include".
import * as L from "leaflet";

declare module "leaflet" {
  interface MarkerClusterGroupOptions extends L.LayerOptions {
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyOnMaxZoom?: boolean;
    disableClusteringAtZoom?: number;
    maxClusterRadius?: number | ((zoom: number) => number);
    iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
  }

  interface MarkerClusterEvent extends L.LeafletEvent {
    layer: MarkerCluster;
  }

  class MarkerCluster extends L.Marker {
    getAllChildMarkers(): L.Marker[];
    getBounds(): L.LatLngBounds;
    spiderfy(): void;
  }

  class MarkerClusterGroup extends L.FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: L.Layer): this;
    removeLayer(layer: number | L.Layer): this;
    clearLayers(): this;
    getBounds(): L.LatLngBounds;
    options: MarkerClusterGroupOptions;

    on(type: "clusterclick", fn: (event: MarkerClusterEvent) => void, context?: unknown): this;
    off(type: "clusterclick", fn?: (event: MarkerClusterEvent) => void, context?: unknown): this;

    zoomToShowLayer(layer: L.Layer, callback?: () => void): this;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}

// Side-effect module declarations so TS accepts imports.
declare module "leaflet.markercluster" {}