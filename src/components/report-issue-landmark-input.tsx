import { useSafeThemeContext } from "@/context/safe-theme-context";
import React from "react";
import { useFormContext } from "react-hook-form";
import IconWithTooltip from "./tooltip-with-icon";

const LandmarkInput: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const { register } = useFormContext();

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">Nearby Landmark</label>
        <IconWithTooltip
          theme={theme}
          id="landmark"
          tooltipPlacement="left"
          content="Mention any nearby landmark to help locate the issue (e.g., 'Near St. Mary's Church')"
        />
      </div>
      <input
        className="w-full rounded border p-2"
        placeholder="E.g., Near the library, opposite the gas station"
        {...register("landmark")}
      />
    </div>
  );
};

export default LandmarkInput;