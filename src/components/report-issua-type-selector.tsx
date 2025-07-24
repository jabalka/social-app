import { useSafeThemeContext } from "@/context/safe-theme-context";
import { ISSUE_TYPES } from "@/lib/report-issue";
import { IssueType } from "@prisma/client";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import RequiredStar from "./required-star";
import IconWithTooltip from "./tooltip-with-icon";

interface IssueTypeSelectProps {
  watchedIssueType: IssueType;
}

const IssueTypeSelect: React.FC<IssueTypeSelectProps> = ({ watchedIssueType }) => {
  const { theme } = useSafeThemeContext();
  const { control } = useFormContext();

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">
          Issue Type
          <RequiredStar />
        </label>
        <IconWithTooltip
          theme={theme}
          id="issue-type"
          tooltipPlacement="left"
          content="Select the type of issue you're reporting"
        />
      </div>
      <Controller
        control={control}
        name="issueType"
        rules={{ required: true }}
        render={({ field }) => (
          <div className="relative">
            <select className="w-full rounded border p-2 pr-8" {...field}>
              {ISSUE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        )}
      />

      {watchedIssueType && (
        <div className="mt-2 rounded-md bg-gray-100 p-2 text-xs dark:bg-gray-800">
          <p>
            {ISSUE_TYPES.find((t) => t.value === watchedIssueType)?.description ||
              "Please describe the issue in detail"}
          </p>
        </div>
      )}
    </div>
  );
};

export default IssueTypeSelect;
