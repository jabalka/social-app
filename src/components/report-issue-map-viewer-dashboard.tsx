"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { ISSUE_TYPES, IssueTypeValue } from "@/lib/report-issue";
import type { AuthUser } from "@/models/auth.types";
import type { ReportIssueReport } from "@/models/report-issue.types";
import { IssueStatus } from "@prisma/client";
import { useEffect, useId, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import ReportIssuePopupContent from "./map-viewer-report-issue-pop-up";

// CSS only
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";

import { LeafletModule, loadLeafletWithMarkerCluster } from "@/utils/leaflet-loade";
import type * as L from "leaflet";

type MarkerEntry = { marker: L.Marker; status: IssueStatus };
type ReportIssueMarker = L.Marker & {
  __reportIssueType?: IssueTypeValue;
  __reportIssueStatus?: IssueStatus;
};

export const ISSUE_TYPE_EMOJI: Record<IssueTypeValue, string> = Object.fromEntries(
  ISSUE_TYPES.map(({ value, icon }) => [value, icon]),
) as Record<IssueTypeValue, string>;

const STATUS_COLOR: Record<IssueStatus | "UNDER_REVIEW", string> = {
  REPORTED: "#6B7280",
  IN_PROGRESS: "#F59E0B",
  RESOLVED: "#10B981",
  REJECTED: "#EF4444",
  UNDER_REVIEW: "#3B82F6",
};

const getIssueEmoji = (issueType?: string | null): string =>
  (issueType && ISSUE_TYPE_EMOJI[issueType as IssueTypeValue]) || "❓";

const buildDivIcon = (Lmod: LeafletModule, issueType: string | null | undefined, status: IssueStatus): L.DivIcon => {
  const emoji = getIssueEmoji(issueType);
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
  return Lmod.divIcon({
    className: "report-issue-emoji-icon",
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 42],
    popupAnchor: [0, -36],
  });
};

const buildClusterIcon = (Lmod: LeafletModule, cluster: L.MarkerCluster): L.DivIcon => {
  const markers = cluster.getAllChildMarkers();
  const typesCount = new Map<IssueTypeValue, number>();
  const statusesCount = new Map<IssueStatus, number>();

  markers.forEach((m) => {
    const mm = m as ReportIssueMarker;
    const t = mm.__reportIssueType;
    const s = mm.__reportIssueStatus;
    if (t) typesCount.set(t, (typesCount.get(t) || 0) + 1);
    if (s) statusesCount.set(s, (statusesCount.get(s) || 0) + 1);
  });

  const total = markers.length;
  const types = Array.from(typesCount.keys());

  let ring = "#6B7280";
  if (statusesCount.size > 0) {
    let best: { status: IssueStatus | null; count: number } = { status: null, count: 0 };
    statusesCount.forEach((c, s) => {
      if (c > best.count) best = { status: s, count: c };
    });
    if (best.status) ring = STATUS_COLOR[best.status] || ring;
  }

  const countBadge = `
    <div style="
      position:absolute;right:-4px;bottom:-4px;
      min-width:22px;height:22px;padding:0 6px;
      display:flex;align-items:center;justify-content:center;
      background:#111827;color:#fff;border-radius:9999px;
      font-size:12px;font-weight:700;border:2px solid #fff;
      box-shadow:0 2px 5px rgba(0,0,0,0.3);
    ">${total}</div>
  `;

  if (types.length <= 1) {
    const emoji = getIssueEmoji(types[0]);
    const html = `
      <div style="
        position:relative;
        display:flex;align-items:center;justify-content:center;
        width:48px;height:48px;border-radius:50%;
        background:#fff;border:3px solid ${ring};
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        font-size:24px;line-height:1;
      ">${emoji}${countBadge}</div>
    `;
    return Lmod.divIcon({
      className: "report-issue-cluster-icon",
      html,
      iconSize: [48, 48],
      iconAnchor: [24, 46],
      popupAnchor: [0, -40],
    });
  }

  const distinct = types.slice(0, 4);
  const emojis = distinct.map(getIssueEmoji);
  const grid = `
    <div style="
      display:grid;grid-template-columns:repeat(2, 1fr);
      gap:2px;width:44px;height:44px;padding:2px;
    ">
      ${emojis
        .map(
          (e) => `
        <div style="
          display:flex;align-items:center;justify-content:center;
          background:#fff;border-radius:6px;border:2px solid ${ring};
          font-size:16px;
        ">${e}</div>`,
        )
        .join("")}
    </div>
  `;
  const html = `
    <div style="
      position:relative;display:flex;align-items:center;justify-content:center;
      width:48px;height:48px;border-radius:12px;
      background:transparent;box-shadow:0 2px 8px rgba(0,0,0,0.25);
      border:0;
    ">
      ${grid}
      ${countBadge}
    </div>
  `;
  return Lmod.divIcon({
    className: "report-issue-cluster-icon",
    html,
    iconSize: [48, 48],
    iconAnchor: [24, 46],
    popupAnchor: [0, -40],
  });
};

const ReportIssueMapViewerDashboard: React.FC<{
  user: AuthUser;
  issues: ReportIssueReport[];
  refreshIssues: () => void;
}> = ({ issues }) => {
  const containerId = useId();
  const mapRef = useRef<L.Map | null>(null);
  const groupRef = useRef<L.MarkerClusterGroup | L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());
  const popupRootRef = useRef<Root | null>(null);

  const { theme } = useSafeThemeContext();

  const LRef = useRef<LeafletModule | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [hasCluster, setHasCluster] = useState(false);

  const closePopup = () => {
    try {
      // Defer unmount to avoid "synchronously unmount while rendering"
      const root = popupRootRef.current;
      if (root) {
        setTimeout(() => {
          try {
            root.unmount();
          } catch {}
        }, 0);
      }
    } catch {}
    popupRootRef.current = null;
    try {
      mapRef.current?.closePopup();
    } catch {}
  };

  const openPopupAt = (Lmod: LeafletModule, reportIssue: ReportIssueReport, marker: L.Marker) => {
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;

    closePopup();

    const container = document.createElement("div");
    const root = createRoot(container);
    // Important: pass theme as prop; ReportIssuePopupContent must accept `theme` and avoid using context.
    root.render(<ReportIssuePopupContent issue={reportIssue} theme={theme} />);
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
      const current = popupRootRef.current;
      if (current === root) {
        setTimeout(() => {
          try {
            current?.unmount();
          } catch {}
          if (popupRootRef.current === current) popupRootRef.current = null;
        }, 0);
      }
    });

    marker.openPopup();
  };

  // Load Leaflet + plugin
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof window === "undefined") return;
      const { L, hasCluster } = await loadLeafletWithMarkerCluster();
      if (!mounted) return;
      LRef.current = L;
      setHasCluster(hasCluster);
      setLeafletReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Initialize map
  useEffect(() => {
    const Lmod = LRef.current;
    if (!leafletReady || !Lmod) return;

    const container = document.getElementById(containerId);
    if (!container || mapRef.current) return;

    const map = Lmod.map(container).setView([51.505, -0.09], 6);
    mapRef.current = map;
    Lmod.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { zIndex: 10 }).addTo(map);

    const group: L.MarkerClusterGroup | L.LayerGroup = hasCluster
      ? Lmod.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 60,
          spiderfyOnMaxZoom: true,
          iconCreateFunction: (cluster) => buildClusterIcon(Lmod, cluster),
        })
      : Lmod.layerGroup();

    if (hasCluster) {
      (group as L.MarkerClusterGroup).on("clusterclick", (e) => {
        const bounds = e.layer.getBounds();
        if (map.getZoom() < map.getMaxZoom()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        } else {
          e.layer.spiderfy();
        }
      });
    }

    group.addTo(map);
    groupRef.current = group;

    const ro = new ResizeObserver(() => setTimeout(() => map.invalidateSize(), 0));
    ro.observe(container);

    return () => {
      try {
        ro.disconnect();
      } catch {}

      markerMapRef.current.forEach(({ marker }) => {
        try {
          groupRef.current?.removeLayer(marker);
        } catch {}
      });
      markerMapRef.current.clear();

      if (groupRef.current && mapRef.current) {
        try {
          (groupRef.current as L.LayerGroup).removeFrom(mapRef.current);
        } catch {}
      }
      groupRef.current = null;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
      }
      mapRef.current = null;

      // Defer popup root cleanup if still mounted
      const root = popupRootRef.current;
      if (root) {
        setTimeout(() => {
          try {
            root.unmount();
          } catch {}
          if (popupRootRef.current === root) popupRootRef.current = null;
        }, 0);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, leafletReady, hasCluster]);

  // Sync markers
  useEffect(() => {
    const Lmod = LRef.current;
    const map = mapRef.current as L.Map | null;
    const group = groupRef.current;
    if (!leafletReady || !Lmod || !map || !map.getPane("markerPane") || !group) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(issues.map((p) => p.id));

    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try {
          group.removeLayer(entry.marker);
        } catch {}
        markerMap.delete(id);
      }
    }

    issues
      .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
      .forEach((ri) => {
        const existing = markerMap.get(ri.id);
        const icon = buildDivIcon(Lmod, ri.issueType, ri.status);

        const handleClick = () => {
          const m = markerMap.get(ri.id)?.marker;
          if (m) openPopupAt(Lmod, ri, m);
        };

        if (!existing) {
          const marker = Lmod.marker([ri.latitude as number, ri.longitude as number], { icon }) as ReportIssueMarker;
          marker.__reportIssueType = ri.issueType as IssueTypeValue | undefined;
          marker.__reportIssueStatus = ri.status;
          marker.on("click", handleClick);
          (group as L.LayerGroup).addLayer(marker);
          markerMap.set(ri.id, { marker, status: ri.status });
        } else {
          const marker = existing.marker as ReportIssueMarker;
          marker.__reportIssueType = ri.issueType as IssueTypeValue | undefined;
          marker.__reportIssueStatus = ri.status;
          existing.marker.setIcon(icon);
          existing.status = ri.status;
          existing.marker.off("click");
          existing.marker.on("click", handleClick);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues, leafletReady, hasCluster]);

  return <div id={containerId} className="relative z-10 h-full w-full" />;
};

export default ReportIssueMapViewerDashboard;
