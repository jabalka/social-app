"use client";

import { useReportIssueModal } from "@/context/report-issue-modal-context";
import { useSafeUser } from "@/context/user-context";
import { ReportIssueReport } from "@/models/report-issue.types";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React from "react";
import DefaultImage from "../../public/images/project-image-dedfault.png";
import { Button } from "./ui/button";

const ReportIssueCard: React.FC<{
  issue: ReportIssueReport;
  theme: string;
  selected?: boolean;
  onSelect?: () => void;
}> = ({ issue, theme, selected, onSelect }) => {
  const { openIssueModal } = useReportIssueModal();
  const { user: currentUser } = useSafeUser();

  const handleViewDetails = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await openIssueModal(issue.id);
  };

  const rootClass = cn(
    "flex w-full min-h-[260px] cursor-pointer flex-col justify-between rounded border p-4 shadow transition",
    "hover:border-violet-400/60 hover:shadow-md",
    selected ? "ring-2 ring-violet-500/70" : "ring-0",
    theme === Theme.DARK ? "bg-zinc-900/60" : "bg-white",
  );
  console.log(issue.images?.[0]?.url);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.()}
      className={rootClass}
    >
      <div className="flex flex-col gap-3 md:flex-row">
        {/* LEFT */}
        <div className="flex-1">
          <h2 className="mb-1 text-sm font-bold">{issue.title}</h2>
          <p className="line-clamp-3 text-xs">{issue.description}</p>

          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <span className="rounded bg-zinc-200 px-2 py-0.5 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              {issue.issueType}
            </span>
            <span className="rounded bg-zinc-200 px-2 py-0.5 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              {issue.status}
            </span>
            <span className="rounded bg-zinc-200 px-2 py-0.5 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              {issue.priority}
            </span>
          </div>

          <div className="group relative mt-3 inline-flex w-40 overflow-hidden rounded-full p-[1px]">
            <Button
              className={cn(
                "relative w-full rounded-full py-2 text-sm font-bold outline-4 outline-gray-200 hover:outline-8",
                {
                  "bg-gradient-to-br from-[#f3cdbd] via-[#d3a18c] to-[#bcaca5] text-zinc-700 hover:bg-gradient-to-br hover:from-[#b79789] hover:via-[#ddbeb1] hover:to-[#92817a] hover:text-zinc-50 hover:outline-gray-200":
                    theme === Theme.LIGHT,
                  "bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#bda69c] text-zinc-100 hover:bg-gradient-to-br hover:from-[#ff6913]/50 hover:via-white/20 hover:to-[#ff6913]/60 hover:text-gray-600 hover:outline-gray-700":
                    theme === Theme.DARK,
                },
              )}
              onClick={handleViewDetails}
            >
              View Details
              <span
                className={cn("pointer-events-none absolute -inset-[1px] overflow-hidden rounded-full", {
                  "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
                  "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
                })}
              />
            </Button>
          </div>
        </div>

        {/* RIGHT: first image if exists */}
        <div className="h-32 overflow-hidden rounded-2xl md:ml-6 md:h-auto md:w-1/3">
          <Image
            src={issue.images?.[0]?.url || DefaultImage}
            alt={`${issue.title} preview`}
            width={240}
            height={240}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-4 flex justify-between text-sm">
        <div className="flex flex-col items-center">
          <span>❤️ {issue.likes?.length || 0}</span>
          <span className="text-xs">Likes</span>
        </div>
        <div className="flex flex-col items-center">
          <span>💬 {issue.comments?.length || 0}</span>
          <span className="text-xs">Comments</span>
        </div>
      </div>
    </div>
  );
};

export default ReportIssueCard;
