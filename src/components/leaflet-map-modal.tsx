"use client";
import React, { useState } from "react";
import MapWrapper from "./map-wrapper";

interface LeafletMapModalProps {
  open: boolean;
  onPick: (lat: number, lng: number) => void;
  onClose: () => void;
  defaultPosition?: [number, number];
}

export const LeafletMapModal: React.FC<LeafletMapModalProps> = ({
  open,
  onPick,
  onClose,
  defaultPosition = [51.505, -0.09],
}) => {
  const [picked, setPicked] = useState<[number, number] | null>(null);

  // Called when user clicks the map
  const handleMapPick = (lat: number, lng: number) => {
    setPicked([lat, lng]);
  };

  const handleConfirm = () => {
    if (picked) onPick(picked[0], picked[1]);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
        <div className="font-semibold mb-2">Pick a location on the map</div>
        <div className="mb-3 h-72">
          <MapWrapper
            position={picked || defaultPosition}
            onPick={handleMapPick}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!picked}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeafletMapModal;
