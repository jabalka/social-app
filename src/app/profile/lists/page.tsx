"use client";

import IdeaListOverviewModal from "@/components/idea-list-overview-modal";
import TopTabs, { TopTabItem } from "@/components/profile-lists-top-tabs";
import ProfileMap from "@/components/profile-map";
// import ProfileIdeas from "@/components/profile-PAGE/ideas-list/profile-ideas";
// import ProfileProjects from "@/components/profile-PAGE/projects-list/profile-projects";
import ProjectListOverviewModal from "@/components/project-list-overview-modal";
import GlowingBrownButton from "@/components/shared/glowing-brown-button";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Building2, Lightbulb, MessageSquareWarning } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

const ProfileListsPage: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const [activeTab, setActiveTab] = useState<"projects" | "ideas" | "issues">("projects");

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);

  const tabs: TopTabItem[] = useMemo(
    () => [
      { key: "projects", label: "Projects", icon: <Building2 className="h-4 w-4" /> },
      { key: "ideas", label: "Ideas", icon: <Lightbulb className="h-4 w-4" /> },
      { key: "issues", label: "Reported Issues", icon: <MessageSquareWarning className="h-4 w-4" /> },
    ],
    [],
  );

  const ActiveIcon = useMemo(() => {
    switch (activeTab) {
      case "projects":
        return Building2;
      case "ideas":
        return Lightbulb;
      case "issues":
        return MessageSquareWarning;
      default:
        return Building2;
    }
  }, [activeTab]);

  const handleTabChange = (key: string) => {
    const mapped = key as "projects" | "ideas" | "issues";
    setActiveTab(mapped);
  };

  const openActiveModal = useCallback(() => {
    switch (activeTab) {
      case "projects":
        setIsProjectModalOpen(true);
        break;
      case "ideas":
        setIsIdeaModalOpen(true);
        break;
      case "issues":
        // setIsIssuesModalOpen(true);
        break;
      default:
        break;
    }
  }, [activeTab]);

  return (
    <>
      <div
        className={cn(
          "mx-auto mt-8 rounded-3xl border-2 px-6 pb-8 pt-4 shadow-2xl backdrop-blur-md",
          theme === Theme.DARK ? "border-zinc-700/40 bg-[#f0e3dd]/10" : "border-zinc-400/10 bg-[#f0e3dd]",
          "md:max-w-2xl lg:max-w-4xl xl:max-w-5xl",
        )}
      >
        <TopTabs tabs={tabs} activeKey={activeTab} onChange={handleTabChange} theme={theme} />

        <div className="flex items-center justify-center py-2">
          <div className="space-y-3 text-center">
            <p className="text-sm opacity-80">Select the button below to view your {activeTab}.</p>

            <GlowingBrownButton onClick={openActiveModal} theme={theme}>
              <span className="inline-flex items-center gap-2">
                <ActiveIcon className="h-4 w-4" />
                <span> View All Your {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
              </span>
            </GlowingBrownButton>
          </div>
        </div>

        <div className="mt-6">
          <ProfileMap activeTab={activeTab} showOwnedOnly={true} />
        </div>
      </div>

      {/* Modals */}
      <ProjectListOverviewModal
        open={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        theme={theme}
        showOwnedOnly={true}
      />

      <IdeaListOverviewModal
        open={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        theme={theme}
        showOwnedOnly={true}
      />

      {/* <IssuesListOverviewModal open={isIssuesModalOpen} onClose={() => setIsIssuesModalOpen(false)} theme={theme} /> */}
    </>
  );
};

export default ProfileListsPage;
