"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

interface MapComponentProps {
  position: [number, number];
  onPick: (lat: number, lng: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ position, onPick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cleanup = () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };

    cleanup();

    if (!containerRef.current) return;

    const map = L.map(containerRef.current).setView(position, 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      zIndex: 10,
    }).addTo(map);

    const icon = L.icon({
      iconUrl: "/images/marker-icon.png",
      iconSize: [60, 60],
      iconAnchor: [30, 60],
    });

    markerRef.current = L.marker(position, { icon }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      onPick(lat, lng);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    });

    return cleanup;
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLatLng(position);

    mapRef.current.setView(position, mapRef.current.getZoom());
  }, [position]);

  return <div ref={containerRef} className="relative z-10 h-full w-full" />;
};

export default MapComponent;
