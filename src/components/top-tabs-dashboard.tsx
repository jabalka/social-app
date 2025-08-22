"use client";

import React, { useMemo, useState } from "react";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import ProjectMapViewerDashboard from "@/components/project-map-viewer-dashboard";
import ReportIssueMapViewerDashboard from "@/components/report-issue-map-viewer-dashboard";
import IdeaMapViewerDashboard from "@/components/idea-map-viewer-dashboard";
import type { Project } from "@/models/project.types";
import type { AuthUser } from "@/models/auth.types";
import { ProjectStatus } from "@prisma/client";
import type { ReportIssueReport } from "@/models/report-issue.types";
import { ISSUE_TYPES } from "@/lib/report-issue";
import type { Idea } from "@/models/idea.types";

export interface TopTabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badgeCount?: number;
}

interface TopTabsProps {
  tabs: TopTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  theme?: string;
}

const TopTabsDashboard: React.FC<TopTabsProps> = ({ tabs, activeKey, onChange, theme }) => {
  const [animationKey, setAnimationKey] = useState<number>(0);

  React.useEffect(() => {
    setAnimationKey((k) => k + 1);
  }, [activeKey]);

  return (
    <div className="w-full">
      <div
        role="tablist"
        className={cn("flex items-end gap-2 border-b-2", {
          "border-zinc-300/60": theme === Theme.LIGHT,
          "border-zinc-700/90": theme === Theme.DARK,
        })}
      >
        {tabs.map((t) => {
          const active = t.key === activeKey;
          return (
            <div key={t.key} className="group relative inline-flex rounded-t-xl">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => !t.disabled && onChange(t.key)}
                disabled={t.disabled}
                className={cn(
                  "relative -mb-[1px] select-none rounded-t-xl px-4 py-2 text-sm font-medium transition-colors",
                  "border overflow-hidden",
                  active ? "border-b-transparent" : "",
                  {
                    "bg-[#fbe8e0] text-zinc-700 border-transparent hover:bg-[#c8b3aa]":
                      theme === Theme.LIGHT && !active,
                    "bg-[#dfc9bf] text-zinc-800 border-zinc-300 shadow-sm":
                      theme === Theme.LIGHT && active,
                    "bg-[#443d3a] text-zinc-200 border-transparent hover:bg-[#bda69c]":
                      theme === Theme.DARK && !active,
                    "bg-[#72645f] text-zinc-300 border-zinc-700 shadow-sm": theme === Theme.DARK && active,
                  },
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {t.icon && <span className="shrink-0">{t.icon}</span>}
                  <span>{t.label}</span>
                  {typeof t.badgeCount === "number" && (
                    <span
                      className={cn(
                        "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs",
                        {
                          "bg-zinc-200 text-zinc-700": theme === Theme.LIGHT,
                          "bg-zinc-700 text-zinc-100": theme === Theme.DARK,
                        },
                      )}
                    >
                      {t.badgeCount}
                    </span>
                  )}
                </span>

                <span
                  key={`${t.key}-${animationKey}`}
                  className={cn("pointer-events-none absolute inset-0 rounded-t-xl", {
                    "animate-snakeBorderHoverLight": theme === Theme.LIGHT && active,
                    "animate-snakeBorderHoverDark": theme === Theme.DARK && active,
                  })}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type ProjectFilter = "ALL" | ProjectStatus;
type IssueTypeValue = (typeof ISSUE_TYPES)[number]["value"];

type DashboardMapTabsProps = {
  user: AuthUser;
  projects: Project[];
  refreshProjects: () => Promise<unknown> | void;
  issues?: ReportIssueReport[] | null;
  refreshIssues?: () => Promise<unknown> | void;
  ideas?: Idea[];
  refreshIdeas?: () => Promise<unknown> | void;
};

const DashboardMapTabs: React.FC<DashboardMapTabsProps> = ({
  user,
  projects,
  refreshProjects,
  issues = [],
  refreshIssues,
  ideas = [],
  refreshIdeas,
}) => {
  const { theme } = useSafeThemeContext();
  const [active, setActive] = useState<"projects" | "ideas" | "issues">("projects");

  // Fetch data when switching tabs so maps have data
  React.useEffect(() => {
    if (active === "ideas" && refreshIdeas) {
      void refreshIdeas();
    } else if (active === "issues" && refreshIssues) {
      void refreshIssues();
    }
  }, [active, refreshIdeas, refreshIssues]);

  // Project filters
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>("ALL");
  const filteredProjects = useMemo(() => {
    if (projectFilter === "ALL") return projects;
    return projects.filter((p) => p.status === projectFilter);
  }, [projects, projectFilter]);

  const showProjectLegend = projectFilter === "ALL";

  // Report issue filters (by type). Empty selection == ALL
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<IssueTypeValue[]>([]);
  const filteredIssues = useMemo(() => {
    const list = issues ?? [];
    if (selectedIssueTypes.length === 0) return list;
    const set = new Set(selectedIssueTypes);
    return list.filter((i) => (i.issueType ? set.has(i.issueType as IssueTypeValue) : false));
  }, [issues, selectedIssueTypes]);

  return (
    <div className="flex w-full flex-col gap-3">
      <TopTabsDashboard
        tabs={[
          { key: "projects", label: "Projects" },
          { key: "ideas", label: "Ideas" },
          { key: "issues", label: "Reported Issues" },
        ]}
        activeKey={active}
        onChange={(k) => setActive(k as "projects" | "ideas" | "issues")}
        theme={theme}
      />

      {/* Filter row */}
      <div className="flex items-center justify-between gap-3">
        {active === "projects" && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value as ProjectFilter)}
              className="rounded-md border px-2 py-1 text-sm"
            >
              <option value="ALL">Show All</option>
              <option value="PROPOSED">Only Proposed</option>
              <option value="IN_PROGRESS">Only In Progress</option>
              <option value="COMPLETED">Only Completed</option>
              <option value="REJECTED">Only Rejected</option>
            </select>
          </div>
        )}

        {active === "issues" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Types:</span>
            <button
              type="button"
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                selectedIssueTypes.length === 0 ? "bg-zinc-800 text-white" : "bg-transparent",
              )}
              onClick={() => setSelectedIssueTypes([])}
            >
              All
            </button>
            {ISSUE_TYPES.map((t) => {
              const on = selectedIssueTypes.includes(t.value as IssueTypeValue);
              return (
                <button
                  key={t.value}
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    on ? "bg-zinc-800 text-white" : "bg-transparent",
                  )}
                  onClick={() =>
                    setSelectedIssueTypes((prev) =>
                      on ? prev.filter((v) => v !== (t.value as IssueTypeValue)) : [...prev, t.value as IssueTypeValue],
                    )
                  }
                  title={t.label}
                >
                  {t.icon} {t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Map area */}
      <div className="relative h-[420px] w-full overflow-hidden rounded-lg border">
        {active === "projects" && (
          <ProjectMapViewerDashboard
            user={user}
            projects={filteredProjects}
            refreshProjects={refreshProjects as () => void}
            showLegend={showProjectLegend}
          />
        )}
        {active === "ideas" && (
          <IdeaMapViewerDashboard ideas={ideas ?? []} refreshIdeas={refreshIdeas || (() => {})} />
        )}
        {active === "issues" && refreshIssues && (
          <ReportIssueMapViewerDashboard
            user={user}
            issues={filteredIssues ?? []}
            refreshIssues={refreshIssues as () => void}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardMapTabs;