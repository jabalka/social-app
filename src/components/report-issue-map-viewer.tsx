"use client";

import { ISSUE_TYPES, IssueTypeValue } from "@/lib/report-issue";
import { AuthUser } from "@/models/auth.types";
import { ReportIssueReport } from "@/models/report-issue.types";
import { IssueStatus } from "@prisma/client";
import L from "leaflet";
import { useEffect, useId, useRef } from "react";
import { createRoot, Root } from "react-dom/client";

// Typed plugin + CSS (requires npm i leaflet.markercluster @types/leaflet.markercluster)
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import ReportIssuePopupContent from "./map-viewer-report-issue-pop-up";
import ReportIssueMapLegend from "./report-issue-map-legend";
import { useSafeThemeContext } from "@/context/safe-theme-context";

// value -> emoji map from ISSUE_TYPES (single source of truth)
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

export interface Props {
  user?: AuthUser;
  reportIssues: ReportIssueReport[];
  refreshReportIssues?: () => void;
  selectedIssueId?: string;
  // Allow clearing via undefined and provide explicit clearer
  onSelectIssue?: (id?: string) => void;
  onClearIssueSelection?: () => void;
  selectable?: boolean;
  enablePopup?: boolean; // false on profile/lists
}

type MarkerEntry = { marker: L.Marker; status: IssueStatus };
type ReportIssueMarker = L.Marker & {
  __reportIssueType?: IssueTypeValue;
  __reportIssueStatus?: IssueStatus;
};

const NON_SELECTED_OPACITY = 0.6;

const getIssueEmoji = (issueType?: string | null): string =>
  (issueType && ISSUE_TYPE_EMOJI[issueType as IssueTypeValue]) || "❓";

const buildDivIcon = (issueType: string | null | undefined, status: IssueStatus): L.DivIcon => {
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
  return L.divIcon({
    className: "report-issue-emoji-icon",
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 42],
    popupAnchor: [0, -36],
  });
};

const buildClusterIcon = (cluster: L.MarkerCluster): L.DivIcon => {
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
    return L.divIcon({
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
  return L.divIcon({
    className: "report-issue-cluster-icon",
    html,
    iconSize: [48, 48],
    iconAnchor: [24, 46],
    popupAnchor: [0, -40],
  });
};

const ReportIssueMapViewer: React.FC<Props> = ({
  //   user,
  reportIssues,
  //   refreshReportIssues,
  selectedIssueId,
  onSelectIssue,
  onClearIssueSelection,
  selectable = true,
  enablePopup = true,
}) => {
  const containerId = useId();
  const mapRef = useRef<L.Map | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const highlightRef = useRef<L.CircleMarker | null>(null);
  const popupRootRef = useRef<Root | null>(null);

  const { theme } = useSafeThemeContext();

  // Refs to avoid stale closures
  const selectedIdRef = useRef<string | undefined>(selectedIssueId);
  useEffect(() => {
    selectedIdRef.current = selectedIssueId;
  }, [selectedIssueId]);

  const onSelectRef = useRef<Props["onSelectIssue"]>(onSelectIssue);
  useEffect(() => {
    onSelectRef.current = onSelectIssue;
  }, [onSelectIssue]);

  const onClearRef = useRef<Props["onClearIssueSelection"]>(onClearIssueSelection);
  useEffect(() => {
    onClearRef.current = onClearIssueSelection;
  }, [onClearIssueSelection]);

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
    if (!enablePopup) return;
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;

    closePopup();
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(<ReportIssuePopupContent issue={reportIssue} theme={theme}/>);
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

  // Init map once
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || mapRef.current) return;

    const map = L.map(container).setView([51.505, -0.09], 6);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { zIndex: 10 }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster) => buildClusterIcon(cluster),
    });
    clusterGroup.on("clusterclick", (e) => {
      const bounds = e.layer.getBounds();
      if (map.getZoom() < map.getMaxZoom()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      } else {
        e.layer.spiderfy();
      }
    });
    clusterGroup.addTo(map);
    clusterGroupRef.current = clusterGroup;

    // Click empty map => clear selection (so list also clears)
    const handleMapClick = () => {
      if (!selectedIdRef.current) return;

      if (onClearRef.current) {
        onClearRef.current();
      } else if (onSelectRef.current) {
        onSelectRef.current(undefined); // fallback: clear via onSelect(undefined)
      }

      // Local visual cleanup
      markerMapRef.current.forEach(({ marker }) => {
        try {
          marker.setOpacity(1);
          marker.setZIndexOffset(0);
        } catch {}
      });
      if (highlightRef.current) {
        try {
          highlightRef.current.remove();
        } catch {}
        highlightRef.current = null;
      }
    };
    map.on("click", handleMapClick);

    const ro = new ResizeObserver(() => setTimeout(() => map.invalidateSize(), 0));
    ro.observe(container);

    return () => {
      try {
        ro.disconnect();
      } catch {}
      map.off("click", handleMapClick);

      markerMapRef.current.forEach(({ marker }) => {
        try {
          clusterGroupRef.current?.removeLayer(marker);
        } catch {}
      });
      markerMapRef.current.clear();

      if (highlightRef.current) {
        try {
          highlightRef.current.remove();
        } catch {}
      }
      highlightRef.current = null;

      // restore marker visuals
      markerMapRef.current.forEach(({ marker }) => {
        try {
          marker.setOpacity(1);
          marker.setZIndexOffset(0);
        } catch {}
      });

      closePopup();

      if (clusterGroupRef.current && mapRef.current) {
        try {
          clusterGroupRef.current.removeFrom(mapRef.current);
        } catch {}
      }
      clusterGroupRef.current = null;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !map.getPane("markerPane") || !clusterGroup) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(reportIssues.map((p) => p.id));

    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try {
          clusterGroup.removeLayer(entry.marker);
        } catch {}
        markerMap.delete(id);
      }
    }

    const hasSelectionHandler = typeof onSelectRef.current === "function";

    reportIssues
      .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
      .forEach((ri) => {
        const existing = markerMap.get(ri.id);
        const icon = buildDivIcon(ri.issueType, ri.status);

        const handleClick = () => {
          if (!selectable || !hasSelectionHandler) {
            if (enablePopup) openPopupAt(ri, (markerMap.get(ri.id) as MarkerEntry).marker);
            return;
          }
          if (selectedIdRef.current !== ri.id) {
            onSelectRef.current?.(ri.id);
          } else if (enablePopup) {
            openPopupAt(ri, (markerMap.get(ri.id) as MarkerEntry).marker);
          } else {
            onSelectRef.current?.(ri.id);
          }
        };

        if (!existing) {
          const marker = L.marker([ri.latitude as number, ri.longitude as number], { icon }) as ReportIssueMarker;
          marker.__reportIssueType = ri.issueType as IssueTypeValue | undefined;
          marker.__reportIssueStatus = ri.status;
          marker.on("click", handleClick);

          clusterGroup.addLayer(marker);
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
  }, [reportIssues, selectable, enablePopup]);

  // Selection pan/highlight + zoomToShowLayer + dim others
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !map.getPane("markerPane")) return;

    if (highlightRef.current) {
      try {
        highlightRef.current.remove();
      } catch {}
      highlightRef.current = null;
    }

    // reset visuals
    markerMapRef.current.forEach(({ marker }) => {
      try {
        marker.setOpacity(1);
        marker.setZIndexOffset(0);
      } catch {}
    });

    if (!selectedIssueId) return;
    const entry = markerMapRef.current.get(selectedIssueId);
    if (!entry) return;

    const showSelected = () => {
      const latlng = entry.marker.getLatLng();
      map.panTo(latlng, { animate: true });
      try {
        entry.marker.setZIndexOffset(1000);
      } catch {}

      markerMapRef.current.forEach((e, id) => {
        try {
          e.marker.setOpacity(id === selectedIssueId ? 1 : NON_SELECTED_OPACITY);
        } catch {}
      });

      const circle = L.circleMarker(latlng, {
        radius: 14,
        color: "#7C3AED",
        weight: 3,
        opacity: 0.9,
        fillColor: "#C4B5FD",
        fillOpacity: 0.3,
      }).addTo(map);
      highlightRef.current = circle;
    };

    if (clusterGroup) {
      clusterGroup.zoomToShowLayer(entry.marker, showSelected);
    } else {
      showSelected();
    }
  }, [selectedIssueId]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
      <ReportIssueMapLegend />
    </div>
  );
};

export default ReportIssueMapViewer;