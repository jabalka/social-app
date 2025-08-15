"use client";

import TopTabs, { TopTabItem } from "@/components/profile-lists-top-tabs";
import ProfileMap from "@/components/profile-map";
import ProjectListOverview from "@/components/projects-list-overview";
import IdeaListOverview from "@/components/idea-list-overview";
// If you plan to add issues later, create IssuesListOverview and import it here.

import { ProjectProvider } from "@/context/project-context";
import { IdeaProvider } from "@/context/idea-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Building2, Lightbulb, MessageSquareWarning } from "lucide-react";
import React, { useMemo, useState } from "react";

const ProfileListsPage: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const [activeTab, setActiveTab] = useState<"projects" | "ideas" | "issues">("projects");

  const tabs: TopTabItem[] = useMemo(
    () => [
      { key: "projects", label: "Projects", icon: <Building2 className="h-4 w-4" /> },
      { key: "ideas", label: "Ideas", icon: <Lightbulb className="h-4 w-4" /> },
      { key: "issues", label: "Reported Issues", icon: <MessageSquareWarning className="h-4 w-4" /> },
    ],
    []
  );

  const handleTabChange = (key: string) => {
    const mapped = key as "projects" | "ideas" | "issues";
    setActiveTab(mapped);
  };

  return (
    <ProjectProvider>
      <IdeaProvider>
        <div
          className={cn(
            "mx-auto mt-8 rounded-3xl border-2 px-6 pb-8 pt-4 shadow-2xl backdrop-blur-md",
            theme === Theme.DARK ? "border-zinc-700/40 bg-[#f0e3dd]/10" : "border-zinc-400/10 bg-[#f0e3dd]",
            "md:max-w-2xl lg:max-w-4xl xl:max-w-5xl"
          )}
        >
          <TopTabs tabs={tabs} activeKey={activeTab} onChange={handleTabChange} theme={theme} />

          {/* Map switches with the active tab and shows only the author's items */}
          <div className="mt-1">
            <ProfileMap activeTab={activeTab} showOwnedOnly />
          </div>

          {/* List below the map, matching the selected tab */}
          <div className="mt-2">
            {activeTab === "projects" && <ProjectListOverview showOwnedOnly />}
            {activeTab === "ideas" && <IdeaListOverview showOwnedOnly />}
            {activeTab === "issues" && (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm opacity-70">
                Reported Issues list coming soon…
              </div>
            )}
          </div>
        </div>
      </IdeaProvider>
    </ProjectProvider>
  );
};

export default ProfileListsPage;