"use client";

import IdeaListOverview from "@/components/idea-list-overview";
import TopTabs, { TopTabItem } from "@/components/top-tabs";
import ProfileMap from "@/components/profile-map";
import ProjectListOverview from "@/components/project-list-overview";
import ReportIssueListOverview from "@/components/report-issue-list-overview";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Building2, Lightbulb, MessageSquareWarning } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

const LG_QUERY = "(min-width: 1024px)"; // Tailwind 'lg'

const ProfileListsPage: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const [activeTab, setActiveTab] = useState<"projects" | "ideas" | "issues">("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const listPanelRef = useRef<HTMLDivElement | null>(null);
  const mapPanelInnerRef = useRef<HTMLDivElement | null>(null);
  const [mapHeight, setMapHeight] = useState<number>(260);

  const tabs: TopTabItem[] = useMemo(
    () => [
      { key: "projects", label: "Projects", icon: <Building2 className="h-4 w-4" /> },
      { key: "ideas", label: "Ideas", icon: <Lightbulb className="h-4 w-4" /> },
      { key: "issues", label: "Reported Issues", icon: <MessageSquareWarning className="h-4 w-4" /> },
    ],
    [],
  );

  const applyHeights = () => {
    const mql = window.matchMedia(LG_QUERY);
    if (!mql.matches) {
      setMapHeight(260);
      return;
    }
    const listEl = listPanelRef.current;
    if (!listEl) return;
    const h = listEl.offsetHeight;
    if (h > 0) setMapHeight(h);
  };

  useEffect(() => {
    applyHeights();
    const onResize = () => applyHeights();
    window.addEventListener("resize", onResize);

    const listEl = listPanelRef.current;
    let ro: ResizeObserver | null = null;
    if (listEl) {
      ro = new ResizeObserver(() => applyHeights());
      ro.observe(listEl);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When tab changes, re-apply heights after render
    const id = setTimeout(applyHeights, 0);
    return () => clearTimeout(id);
  }, [activeTab]);

  const handleTabChange = (key: string) => {
    const mapped = key as "projects" | "ideas" | "issues";
    setActiveTab(mapped);

    if (mapped !== "projects") setSelectedProjectId(null);
    if (mapped !== "ideas") setSelectedIdeaId(null);
    if (mapped !== "issues") setSelectedIssueId(null);
  };

  return (
    <div
      className={cn(
        "mx-auto mt-1 rounded-3xl border-2 px-6 pb-8 pt-4 shadow-2xl backdrop-blur-md",
        theme === Theme.DARK ? "border-zinc-700/40 bg-[#f0e3dd]/10" : "border-zinc-400/10 bg-[#f0e3dd]",
        "md:max-w-2xl lg:max-w-6xl xl:max-w-7xl",
      )}
    >
      <TopTabs tabs={tabs} activeKey={activeTab} onChange={handleTabChange} theme={theme} />

      {/* On lg+: 2/3 list (left) and 1/3 map (right). On small: stacked, map fixed height. */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {/* LEFT: List panel (spans 2 columns on lg) */}
        <div ref={listPanelRef} className="order-2 lg:order-1 lg:col-span-2">
          {activeTab === "projects" && (
            <ProjectListOverview
              showOwnedOnly
              selectedId={selectedProjectId ?? undefined}
              onSelect={(id?: string) =>
                setSelectedProjectId((prev) => (id ? (prev === id ? null : id) : null))
              }
              minBodyHeightClass="min-h-[520px]"
            />
          )}
          {activeTab === "ideas" && (
            <IdeaListOverview
              showOwnedOnly
              selectedId={selectedIdeaId ?? undefined}
              onSelect={(id?: string) =>
                setSelectedIdeaId((prev) => (id ? (prev === id ? null : id) : null))
              }
              minBodyHeightClass="min-h-[520px]"
            />
          )}
          {activeTab === "issues" && (
            <ReportIssueListOverview
              showOwnedOnly
              selectedId={selectedIssueId ?? undefined}
              onSelect={(id?: string) =>
                setSelectedIssueId((prev) => (id ? (prev === id ? null : id) : null))
              }
              minBodyHeightClass="min-h-[520px]"
            />
          )}
        </div>

        {/* RIGHT: Map panel (1 column on lg) */}
        <div className="order-1 lg:order-2 lg:col-span-1">
          <div ref={mapPanelInnerRef} className="w-full rounded-xl border" style={{ height: `${mapHeight}px` }}>
            <ProfileMap
              activeTab={activeTab}
              showOwnedOnly
              selectedProjectId={selectedProjectId ?? undefined}
              selectedIdeaId={selectedIdeaId ?? undefined}
              selectedIssueId={selectedIssueId ?? undefined}
              onSelectProject={(id?: string) =>
                setSelectedProjectId((prev) => (id ? (prev === id ? null : id) : null))
              }
              onSelectIdea={(id?: string) =>
                setSelectedIdeaId((prev) => (id ? (prev === id ? null : id) : null))
              }
              onSelectIssue={(id?: string) =>
                setSelectedIssueId((prev) => (id ? (prev === id ? null : id) : null))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileListsPage;