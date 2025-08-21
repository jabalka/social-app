"use client";
import React, { useState } from "react";
import IconWithTooltip from "@/components/icon-with-tooltip";
import TooltipBubble from "@/components/tooltip-bubble";
import ProjectListOverviewModal from "@/components/project-list-overview-modal";
import IdeaListOverviewModal from "@/components/idea-list-overview-modal";
// import IssuesListOverviewModal from "@/components/issues-list-overview-modal";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { ChartColumn } from "lucide-react";

interface Props {
  theme: string;
  userId?: string;
  projectCount: number;
  ideaCount: number;
  reportCount: number;
  commentCount: number;
  projectLikeCount: number;
  commentLikeCount: number;
}

const ProfileStatistics: React.FC<Props> = ({
  theme,
  userId,
  projectCount,
  ideaCount,
  reportCount,
  commentCount,
  projectLikeCount,
  commentLikeCount,
}) => {
  const [openProjects, setOpenProjects] = useState(false);
  const [openIdeas, setOpenIdeas] = useState(false);
  // const [openReports, setOpenReports] = useState(false);

  const linkBase =
    "relative group inline-flex w-fit items-center gap-2 underline underline-offset-4 decoration-transparent hover:decoration-current cursor-pointer";

  return (
    <>
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

        {/* Projects (opens Projects modal) */}
        <div className={linkBase} onClick={() => setOpenProjects(true)}>
          <span>Total Projects: {projectCount}</span>
          <TooltipBubble theme={theme} placement="right" content="View All" />
        </div>

        {/* Ideas (opens Ideas modal) */}
        <div className={linkBase} onClick={() => setOpenIdeas(true)}>
          <span>Total Ideas: {ideaCount}</span>
          <TooltipBubble theme={theme} placement="right" content="View All" />
        </div>

        {/* Reports (opens Reports/Issues modal) */}
        <div className={linkBase} 
        // onClick={
        //   () => setOpenReports(true)
        //   }
          >
          <span>Total Reports: {reportCount}</span>
          <TooltipBubble theme={theme} placement="right" content="View All" />
        </div>

        {/* Keep existing non-linked stats */}
        <p>Total Comments: {commentCount}</p>
        <p>Total Likes on Projects: {projectLikeCount}</p>
        <p>Total Likes on Comments: {commentLikeCount}</p>
      </div>

      {/* Modals */}
      <ProjectListOverviewModal
        open={openProjects}
        onClose={() => setOpenProjects(false)}
        theme={theme}
        showOwnedOnly={true}
        userId={userId}
      />
      <IdeaListOverviewModal
        open={openIdeas}
        onClose={() => setOpenIdeas(false)}
        theme={theme}
        showOwnedOnly={true}
        userId={userId}
      />
      {/* <IssuesListOverviewModal
        open={openReports}
        onClose={() => setOpenReports(false)}
        theme={theme}
        showOwnedOnly={true}
        userId={userId}
      /> */}
    </>
  );
};

export default ProfileStatistics;