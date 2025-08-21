"use client";

// import { useSafeThemeContext } from "@/context/safe-theme-context";
import { ISSUE_TYPES, IssueTypeValue } from "@/lib/report-issue";
import { AuthUser } from "@/models/auth.types";
import { ReportIssueReport } from "@/models/report-issue.types";
import { IssueStatus } from "@prisma/client";
import L from "leaflet";
import { useEffect, useId, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import ReportIssuePopupContent from "./map-viewer-report-issue-pop-up";
import ReportIssueMapLegend from "./report-issue-map-legend";

// Build value -> emoji map
export const ISSUE_TYPE_EMOJI: Record<IssueTypeValue, string> = Object.fromEntries(
  ISSUE_TYPES.map(({ value, icon }) => [value, icon]),
) as Record<IssueTypeValue, string>;

const STATUS_COLOR: Record<IssueStatus, string> = {
  REPORTED: "#6B7280",
  IN_PROGRESS: "#F59E0B",
  RESOLVED: "#10B981",
  REJECTED: "#EF4444",
  UNDER_REVIEW: "#3B82F6", // Added color for UNDER_REVIEW
};

type MarkerEntry = { marker: L.Marker; status: IssueStatus };

const buildDivIcon = (issueType: string | null | undefined, status: IssueStatus): L.DivIcon => {
  const emoji = (issueType && ISSUE_TYPE_EMOJI[issueType as IssueTypeValue]) || "❓";
  const ring = STATUS_COLOR[status] || "#6B7280";
  const html = `
    <div style="
      display:flex;align-items:center;justify-content:center;
      width:44px;height:44px;border-radius:50%;
      background:#fff;border:3px solid ${ring};
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      font-size:22px;line-height:1;
    ">${emoji}</div>
  `;
  return L.divIcon({
    className: "report-issue-emoji-icon",
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 42],
    popupAnchor: [0, -36],
  });
};

const ReportIssueMapViewerDashboard: React.FC<{
  user: AuthUser;
  issues: ReportIssueReport[];
  refreshIssues: () => void;
}> = ({
  // user,
  issues,
  // refreshIssues
}) => {
  const containerId = useId();
  const mapRef = useRef<L.Map | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());
  const popupRootRef = useRef<Root | null>(null);
  //   const { theme } = useSafeThemeContext();

  const closePopup = () => {
    try {
      popupRootRef.current?.unmount();
    } catch {}
    popupRootRef.current = null;
    try {
      mapRef.current?.closePopup();
    } catch {}
  };

  const openPopupAt = (reportIssue: ReportIssueReport, marker: L.Marker) => {
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;

    closePopup();
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(<ReportIssuePopupContent issue={reportIssue} />);
    popupRootRef.current = root;

    marker.bindPopup(container, {
      autoPan: true,
      keepInView: true,
      closeButton: false,
      className: "react-leaflet-card-popup",
      autoClose: true,
      closeOnClick: true,
    });

    marker.on("popupclose", () => {
      try {
        root.unmount();
      } catch {}
      if (popupRootRef.current === root) popupRootRef.current = null;
    });

    marker.openPopup();
  };

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || mapRef.current) return;

    const map = L.map(container).setView([51.505, -0.09], 6);
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { zIndex: 10 }).addTo(map);

    const ro = new ResizeObserver(() => setTimeout(() => map.invalidateSize(), 0));
    ro.observe(container);

    return () => {
      try {
        ro.disconnect();
      } catch {}

      markerMapRef.current.forEach(({ marker }) => {
        try {
          marker.remove();
        } catch {}
      });
      markerMapRef.current.clear();

      closePopup();
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  useEffect(() => {
    const map = mapRef.current as L.Map | null;
    if (!map || !map.getPane("markerPane")) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(issues.map((p) => p.id));

    // remove stale
    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try {
          entry.marker.remove();
        } catch {}
        markerMap.delete(id);
      }
    }

    issues
      .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
      .forEach((ri) => {
        const existing = markerMap.get(ri.id);
        const icon = buildDivIcon(ri.issueType as unknown as IssueTypeValue, ri.status);

        const handleClick = () => {
          const m = (markerMap.get(ri.id) as MarkerEntry).marker;
          openPopupAt(ri, m);
        };

        if (!existing) {
          const marker = L.marker([ri.latitude as number, ri.longitude as number], { icon }).addTo(map);
          marker.on("click", handleClick);
          markerMap.set(ri.id, { marker, status: ri.status });
        } else {
          existing.marker.setIcon(icon);
          existing.status = ri.status;
          existing.marker.off("click");
          existing.marker.on("click", handleClick);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
      <ReportIssueMapLegend />
    </div>
  );
};

export default ReportIssueMapViewerDashboard;
