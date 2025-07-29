import { useSafeThemeContext } from "@/context/safe-theme-context";
import { ISSUE_PRIORITY_LEVELS } from "@/lib/report-issue";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import RequiredStar from "./required-star";
import IconWithTooltip from "./icon-with-tooltip";

const PriorityLevelSelect: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const { control } = useFormContext();

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">
          Priority Level
          <RequiredStar />
        </label>
        <IconWithTooltip theme={theme} id="priority" tooltipPlacement="left" content="How urgent is this issue?" />
      </div>
      <Controller
        control={control}
        name="priority"
        rules={{ required: true }}
        render={({ field }) => (
          <div className="space-y-2">
            {ISSUE_PRIORITY_LEVELS.map((priority) => (
              <label key={priority.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={priority.value}
                  checked={field.value === priority.value}
                  onChange={() => field.onChange(priority.value)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">{priority.label}</span>
                <span className="text-xs text-gray-500">{priority.description}</span>
              </label>
            ))}
          </div>
        )}
      />
    </div>
  );
};

export default PriorityLevelSelect;
