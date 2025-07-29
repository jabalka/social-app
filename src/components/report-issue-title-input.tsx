import { useSafeThemeContext } from "@/context/safe-theme-context";
import { ISSUE_TYPES } from "@/lib/report-issue";
import { IssueType } from "@prisma/client";
import { SquareFunction } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import RequiredStar from "./required-star";
import IconWithTooltip from "./icon-with-tooltip";

interface TitleInputProps {
  watchedTitle: string;
  watchedIssueType: IssueType;
}

const TitleInputWithAutofill: React.FC<TitleInputProps> = ({ watchedTitle, watchedIssueType }) => {
  const { theme } = useSafeThemeContext();
  const { register, setValue } = useFormContext();

  const handleAutoFillTitle = () => {
    const selectedIssue = ISSUE_TYPES.find((type) => type.value === watchedIssueType);
    if (selectedIssue) {
      setValue("title", selectedIssue.autoFill, { shouldValidate: true });
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">
          Title
          <RequiredStar />
        </label>
        <IconWithTooltip
          theme={theme}
          id="title"
          tooltipPlacement="left"
          content="A short, descriptive title for the issue (max 35 characters)"
        />
      </div>
      <div className="flex gap-2">
        <input
          className="w-full rounded border p-2"
          placeholder="Brief issue title"
          maxLength={35}
          {...register("title", { required: true, maxLength: 35 })}
        />
        <button
          type="button"
          onClick={handleAutoFillTitle}
          className="flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <SquareFunction className="h-4 w-4" />
          Auto-Fill
        </button>
      </div>
      <div className="mt-1 flex justify-end text-xs">
        <span className={watchedTitle.length >= 35 ? "font-semibold text-red-500" : "text-gray-500"}>
          {watchedTitle.length}/35
        </span>
      </div>
    </div>
  );
};

export default TitleInputWithAutofill;
