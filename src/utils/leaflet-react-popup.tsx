import type { LeafletModule } from "@/utils/leaflet-loader";
import type * as L from "leaflet";
import React from "react";
import { createRoot, Root } from "react-dom/client";

export function openReactPopup(
  _L: LeafletModule,
  marker: L.Marker,
  node: React.ReactNode,
  options?: L.PopupOptions,
): { close: () => void } {
  const container = document.createElement("div");
  const root: Root = createRoot(container);
  root.render(node);

  try {
    marker.unbindPopup();
  } catch {}

  const popupOptions: L.PopupOptions = {
    autoPan: true,
    keepInView: true,
    closeButton: false,
    className: "react-leaflet-card-popup",
    autoClose: true,
    closeOnClick: true,
    offset: options?.offset ?? [0, -36], // center above the marker
    ...options,
  };

  marker.bindPopup(container, popupOptions);
  marker.openPopup();

  // After React content paints, ask Leaflet to recalc popup position.
  requestAnimationFrame(() => requestAnimationFrame(() => marker.getPopup()?.update()));

  const onClose = () => {
    // Defer unmount to avoid "unmount during render" warnings
    setTimeout(() => {
      try {
        root.unmount();
      } catch {}
    }, 0);

    setTimeout(() => {
      try {
        marker.unbindPopup();
      } catch {}
    }, 0);

    marker.off("popupclose", onClose);
  };

  marker.on("popupclose", onClose);

  const close = () => {
    try {
      marker.closePopup();
    } catch {}
    onClose();
  };

  return { close };
}
