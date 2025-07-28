import React from "react";
import GlowingVioletButton from "./shared/glowing-violet-button";
import RequiredStar from "./required-star";
import IconWithTooltip from "./tooltip-with-icon";
import { Trash2 } from "lucide-react";

interface Props {
  theme: string;
  watch: (field: string) => string;
  handlePostcodeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setShowMap: (value: boolean) => void;
  addressLines: string[];
  addressCoords: string | null;
  required?: boolean;
  resetLocation?: () => void;
}
const LocationPostcodePickup: React.FC<Props> = ({
  theme,
  watch,
  handlePostcodeChange,
  setShowMap,
  addressLines,
  addressCoords,
  required,
  resetLocation,
}) => {
  const hasLocation = addressLines.filter(Boolean).length > 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">
          Location (Postcode or pick on map)
          {required && <RequiredStar />}
        </label>
        <IconWithTooltip
          id="postcode"
          tooltipPlacement="left"
          theme={theme}
          content={
            <>
              Enter a UK postcode or select a point on the map.
              <br />
              This will fill the address and coordinates below.
            </>
          }
        />
      </div>
      <div className="mb-2 flex items-center gap-2">
        <input
          className="w-9/12 rounded border p-2"
          placeholder="Enter UK postcode (auto-fills location)"
          value={watch("postcode")}
          onChange={handlePostcodeChange}
        />
        <GlowingVioletButton onClick={() => setShowMap(true)}>Pick on Map</GlowingVioletButton>
        <button
          type="button"
          onClick={resetLocation}
          disabled={!hasLocation || !resetLocation}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            hasLocation && resetLocation
              ? "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } transition-colors duration-200`}
          title="Reset location"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
      {addressLines.filter(Boolean).length > 0 && (
        <div className="mb-1 rounded border bg-[#00000039] px-3 py-2 text-xs">
          <span className="font-bold">Address:</span>
          {addressLines[0] && <div className="font-medium">{addressLines[0]}</div>}
          {addressLines[1] && <div>{addressLines[1]}</div>}
          {addressLines[2] && <div className="">{addressLines[2]}</div>}
        </div>
      )}
      {addressCoords && <div className="text-[11px] text-gray-500">Coordinates: {addressCoords}</div>}
    </div>
  );
};

export default LocationPostcodePickup;
