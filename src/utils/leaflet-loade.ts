// Utility to load Leaflet and the markercluster plugin in the correct order,
// without using `any`, and in a way that works across different bundlers.

export type LeafletModule = typeof import("leaflet");

// Accept unknown to avoid `any`, then normalize default/namespace interop.
export const normalizeLeaflet = (pkg: unknown): LeafletModule => {
  const mod = pkg as { default?: LeafletModule };
  return (mod?.default ?? (pkg as LeafletModule));
};

export async function loadLeaflet(): Promise<LeafletModule> {
  const pkg = await import("leaflet");
  return normalizeLeaflet(pkg);
}

// Helper type to test for plugin attachment without `any`
type HasClusterFn = {
  markerClusterGroup?: unknown;
};

export async function loadMarkerCluster(L: LeafletModule): Promise<boolean> {
  // Ensure the plugin augments the same instance your code uses.
  (window as unknown as { L?: LeafletModule }).L = L;
  try {
    // Load the plugin via package entry (typed by @types/leaflet.markercluster or your .d.ts)
    await import("leaflet.markercluster");
  } catch (err) {
    console.warn("Failed to import leaflet.markercluster", err);
    return false;
  }
  return typeof (L as LeafletModule & HasClusterFn).markerClusterGroup === "function";
}

export async function loadLeafletWithMarkerCluster(): Promise<{ L: LeafletModule; hasCluster: boolean }> {
  const L = await loadLeaflet();
  const hasCluster = await loadMarkerCluster(L);
  return { L, hasCluster };
}