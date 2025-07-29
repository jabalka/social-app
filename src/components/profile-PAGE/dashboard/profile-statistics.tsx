"use client";
import IconWithTooltip from "@/components/icon-with-tooltip";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { ChartColumn } from "lucide-react";
import React from "react";

interface Props {
  theme: string;
  projectCount: number;
  commentCount: number;
  projectLikeCount: number;
  commentLikeCount: number;
}

const ProfileStatistics: React.FC<Props> = ({
  theme,
  projectCount,
  commentCount,
  projectLikeCount,
  commentLikeCount,
}) => {
  return (
    <div
      className={cn("mt-6 flex flex-col gap-2 rounded-md p-4 shadow md:w-64 lg:w-80", {
        "bg-[#998a8361] text-zinc-700": theme === Theme.LIGHT,
        "bg-[#8c817b41] text-zinc-300": theme === Theme.DARK,
      })}
    >
      <IconWithTooltip
        id="your-statistic"
        className="flex items-center justify-center"
        theme={theme}
        icon={ChartColumn}
        iconClassName="h-6 w-6"
        content="Personal Statistics"
      />
      <p>Total Projects: {projectCount}</p>
      <p>Total Comments: {commentCount}</p>
      <p>Total Likes on Projects: {projectLikeCount}</p>
      <p>Total Likes on Comments: {commentLikeCount}</p>
    </div>
  );
};

export default ProfileStatistics;
