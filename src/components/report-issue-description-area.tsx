import { useSafeThemeContext } from "@/context/safe-theme-context";
import React from "react";
import { useFormContext } from "react-hook-form";
import RequiredStar from "./required-star";
import IconWithTooltip from "./tooltip-with-icon";

interface Props {
  watchedDescription: string;
  maxLength: number;
}

const IssueDescriptionTextarea: React.FC<Props> = ({ watchedDescription, maxLength }) => {
  const { theme } = useSafeThemeContext();
  const { register } = useFormContext();

  const descriptionLength = watchedDescription?.length || 0;
  const isLimitReached = descriptionLength >= maxLength;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">
          Description
          <RequiredStar />
        </label>
        <IconWithTooltip
          theme={theme}
          id="description"
          tooltipPlacement="left"
          content="Provide details about the issue - what's wrong, how severe is it, etc."
        />
      </div>
      <textarea
        className={`w-full rounded border p-2 ${isLimitReached ? "border-red-400" : ""}`}
        placeholder="Describe the issue in detail..."
        {...register("description", { required: true, maxLength })}
        rows={3}
        maxLength={maxLength}
      />
      <div className="mt-1 flex justify-end text-xs">
        <span className={isLimitReached ? "font-semibold text-red-500" : "text-gray-500"}>
          {descriptionLength}/{maxLength}
        </span>
      </div>
    </div>
  );
};

export default IssueDescriptionTextarea;
