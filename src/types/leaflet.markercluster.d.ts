import "leaflet";

declare module "leaflet" {
  interface MarkerClusterGroupOptions extends L.LayerOptions {
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyOnMaxZoom?: boolean;
    disableClusteringAtZoom?: number;
    maxClusterRadius?: number | ((zoom: number) => number);
    iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
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

    // Ensure this is available for zooming to a specific marker
    zoomToShowLayer(layer: L.Layer, callback?: () => void): this;
  }

  interface MarkerClusterEvent extends L.LeafletEvent {
    layer: MarkerCluster;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}

declare module "leaflet.markercluster" {
  // side-effect module; augments leaflet at runtime
}
