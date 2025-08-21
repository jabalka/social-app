"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { IssueStatus } from "@prisma/client";

const STATUS_LABELS: Record<IssueStatus, string> = {
  REPORTED: "Reported",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
  UNDER_REVIEW: "Under Review",
};

const ReportIssueMapLegend: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useSafeThemeContext();
  const dot = "inline-block h-3 w-3 rounded-full mr-2";

  return (
    <div
      className={cn(
        "absolute left-3 top-3 rounded-md px-3 py-2 text-xs shadow",
        theme === Theme.DARK ? "bg-[#5e5753] text-zinc-100" : "bg-[#dbccc5] text-zinc-800",
        className,
      )}
    >
      <div className="mb-2 font-semibold">— Legend —</div>
      <div className="space-y-1">
        <div>
          <span className={cn(dot, "bg-blue-500")} />
          {STATUS_LABELS.REPORTED}
        </div>
        <div>
          <span className={cn(dot, "bg-yellow-500")} />
          {STATUS_LABELS.IN_PROGRESS}
        </div>
        <div>
          <span className={cn(dot, "bg-green-500")} />
          {STATUS_LABELS.RESOLVED}
        </div>
        <div>
          <span className={cn(dot, "bg-red-500")} />
          {STATUS_LABELS.REJECTED}
        </div>
      </div>
    </div>
  );
};

export default ReportIssueMapLegend;
