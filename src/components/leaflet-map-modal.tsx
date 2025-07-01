"use client";
import React, { useState, useEffect, useRef } from "react";
import MapWrapper from "./map-wrapper";
import axios from "axios";
import { cn } from "@/utils/cn.utils";
import { Theme } from "@/types/theme.enum";
import GlowingGreenButton from "./glowing-green-button";
import GlowingPinkButton from "./glowing-pink-button";
import { getPostcodeData } from "@/utils/postcode.utils";

interface LeafletMapModalProps {
  open: boolean;
  theme?: string;
  onPick: (lat: number, lng: number) => void;
  onClose: () => void;
  defaultPosition?: [number, number];
}

export const LeafletMapModal: React.FC<LeafletMapModalProps> = ({
  open,
  onPick,
  onClose,
  theme,
  defaultPosition = [51.505, -0.09],
}) => {
  // Not picked by default!
  const [picked, setPicked] = useState<[number, number] | null>(null);
  const [locationInfo, setLocationInfo] = useState<{
    postcode?: string;
    addressLines?: string[];
    country?: string;
  }>({});
  const wasOpen = useRef(false);

  // Clear pick on open/close
  useEffect(() => {
    if (open && !wasOpen.current) {
      setPicked(defaultPosition ?? null);
      setLocationInfo({});
    }
    wasOpen.current = open;
    // eslint-disable-next-line
  }, [open, defaultPosition]);

  // When picked changes, fetch address info
  useEffect(() => {
    if (!picked) {
      setLocationInfo({});
      return;
    }
    const [lat, lng] = picked;
    getPostcodeData({ lat, lng }).then((result) => {
      console.log("Postcode data:", result);
      if (result) {
        setLocationInfo({
          postcode: result.postcode,
          addressLines: result.addressLines,
          country: result.addressLines?.[2],
        });
      } else {
        // fallback: Nominatim (global)
        axios
          .get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          )
          .then((res) => {
            const addr = res.data.address;
            setLocationInfo({
              postcode: addr?.postcode,
              addressLines: [
                [addr?.road, addr?.neighbourhood, addr?.suburb]
                  .filter(Boolean)
                  .join(", "),
                [
                  addr?.city,
                  addr?.town,
                  addr?.village,
                  addr?.state,
                  addr?.county,
                ]
                  .filter(Boolean)
                  .join(", "),
              ],
              country: addr?.country,
            });
          })
          .catch(() => setLocationInfo({}));
      }
    });
  }, [picked]);

  // Only allow Confirm if user has explicitly picked
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
      <div
        className={cn(
          "rounded-lg shadow-lg p-4 max-w-lg w-full relative",
          {
            "text-zinc-700 bg-[#eeded7]": theme === Theme.LIGHT,
            "text-zinc-200 bg-[#443d3a]": theme === Theme.DARK,
          }
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl hover:text-gray-700"
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

        {picked && (
          <div
            className={cn(
              "mb-3 text-xs border rounded p-2",
              {
                "bg-[#574e4b]": theme === Theme.DARK,
                "bg-[#f5e9e4]": theme === Theme.LIGHT,
              }
            )}
          >
            <div>
              <span className="font-semibold">Coordinates:</span>{" "}
              {picked[0].toFixed(5)}, {picked[1].toFixed(5)}
            </div>
            {locationInfo.postcode && (
              <div>
                <span className="font-semibold">Postcode:</span> {locationInfo.postcode}
              </div>
            )}
            {locationInfo.addressLines &&
              locationInfo.addressLines.map(
                (line, i) =>
                  line && <div key={i}>{line}</div>
              )}
             </div>
        )}

        <div className="flex justify-end gap-2">
          <GlowingPinkButton onClick={onClose}>Cancel</GlowingPinkButton>
          <GlowingGreenButton
          theme={theme}
            disabled={!picked}
            onClick={handleConfirm}
          >
            Confirm Location
          </GlowingGreenButton>
        </div>
      </div>
    </div>
  );
};

export default LeafletMapModal;
