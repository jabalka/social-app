"use client";
import { Theme } from "@/types/theme.enum";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { cn } from "@/utils/cn.utils";
import React from "react";
import { ReportIssueReport } from "@/models/report-issue.types";

const ReportIssuePopupContent: React.FC<{
  issue: ReportIssueReport;
  onClose?: () => void;
}> = ({ issue: reportIssue, onClose }) => {
  const { theme } = useSafeThemeContext();

  return (
    <div
      className={cn(
        "min-w-[240px] max-w-[320px] rounded-lg p-3 text-sm shadow-lg",
        theme === Theme.DARK ? "bg-[#332f2d] text-zinc-100" : "bg-white text-zinc-800",
      )}
    >
      <div className="mb-1 font-semibold">{reportIssue.title}</div>
      <div className="text-xs opacity-70 line-clamp-3">{reportIssue.description}</div>
      <div className="mt-2 text-xs">
        <span className="font-semibold">Type:</span> {reportIssue.issueType}
      </div>
      <div className="mt-1 text-xs">
        <span className="font-semibold">Status:</span> {reportIssue.status}
      </div>
      {onClose && (
        <button
          className={cn(
            "mt-3 rounded px-2 py-1 text-xs font-semibold",
            theme === Theme.DARK ? "bg-zinc-700 text-zinc-100" : "bg-zinc-200 text-zinc-800",
          )}
          onClick={onClose}
        >
          Close
        </button>
      )}
    </div>
  );
};

export default ReportIssuePopupContent;