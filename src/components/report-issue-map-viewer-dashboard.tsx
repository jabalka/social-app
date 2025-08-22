"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { ISSUE_TYPES, IssueTypeValue } from "@/lib/report-issue";
import type { AuthUser } from "@/models/auth.types";
import type { ReportIssueReport } from "@/models/report-issue.types";
import { IssueStatus } from "@prisma/client";
import { useEffect, useId, useRef, useState } from "react";
import { loadLeafletWithMarkerCluster, type LeafletModule } from "@/utils/leaflet-loader";
import { openReactPopup } from "@/utils/leaflet-react-popup";
import { isMarkerDisplayed, nearlySameView } from "@/utils/map-helpers";
import ReportIssuePopupContent from "./map-viewer-report-issue-pop-up";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

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

const NON_SELECTED_OPACITY = 0.6;

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
  const highlightRef = useRef<L.CircleMarker | null>(null);

  const { theme } = useSafeThemeContext();

  const LRef = useRef<LeafletModule | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [hasCluster, setHasCluster] = useState(false);

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const selectedIdRef = useRef<string | undefined>(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

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

  useEffect(() => {
    const Lmod = LRef.current;
    if (!leafletReady || !Lmod) return;

    const container = document.getElementById(containerId);
    if (!container || mapRef.current) return;

    const map = Lmod.map(container, {
      zoomAnimation: true,
      markerZoomAnimation: true,
      fadeAnimation: true,
      inertia: true,
      wheelDebounceTime: 30,
      wheelPxPerZoomLevel: 96,
    }).setView([51.505, -0.09], 6);
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
          map.flyToBounds(bounds, { padding: [40, 40], animate: true, duration: 0.45, easeLinearity: 0.25 });
        } else {
          e.layer.spiderfy();
        }
      });
    }

    group.addTo(map);
    groupRef.current = group;

    const handleMapClick = () => {
      if (!selectedIdRef.current) return;
      selectedIdRef.current = undefined;
      setSelectedId(undefined);
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
      }
      highlightRef.current = null;
      try {
        map.closePopup();
      } catch {}
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
          groupRef.current?.removeLayer(marker);
        } catch {}
      });
      markerMapRef.current.clear();

      if (highlightRef.current) {
        try {
          highlightRef.current.remove();
        } catch {}
      }
      highlightRef.current = null;

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, leafletReady, hasCluster]);

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
          if (selectedIdRef.current !== ri.id) {
            selectedIdRef.current = ri.id;
            setSelectedId(ri.id);
            return;
          }
          const m = markerMap.get(ri.id)?.marker;
          if (m) {
            openReactPopup(
              Lmod,
              m,
              <ReportIssuePopupContent issue={ri} theme={theme} />,
              { offset: [0, -36] },
            );
          }
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
  }, [issues, leafletReady, hasCluster, theme]);

  useEffect(() => {
    const Lmod = LRef.current;
    const map = mapRef.current;
    const group = groupRef.current;
    if (!Lmod || !map || !map.getPane("markerPane")) return;

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
    }
    highlightRef.current = null;

    if (!selectedId) return;
    const entry = markerMapRef.current.get(selectedId);
    if (!entry) return;

    const latlng = entry.marker.getLatLng();
    const targetZoom = Math.max(map.getZoom(), 14);

    const focus = () => {
      if (!nearlySameView(map, latlng, targetZoom)) {
        map.flyTo(latlng, targetZoom, { animate: true, duration: 0.45, easeLinearity: 0.25 });
      }

      try {
        entry.marker.setZIndexOffset(1000);
      } catch {}
      markerMapRef.current.forEach((e, id) => {
        try {
          e.marker.setOpacity(id === selectedId ? 1 : NON_SELECTED_OPACITY);
        } catch {}
      });

      const circle = Lmod.circleMarker(latlng, {
        radius: 14,
        color: "#7C3AED",
        weight: 3,
        opacity: 0.9,
        fillColor: "#C4B5FD",
        fillOpacity: 0.3,
        interactive: false, // prevent click swallowing
      }).addTo(map);
      highlightRef.current = circle;
    };

    if (group && "zoomToShowLayer" in group && !isMarkerDisplayed(entry.marker)) {
      (group as L.MarkerClusterGroup).zoomToShowLayer(entry.marker, focus);
    } else {
      focus();
    }
  }, [selectedId]);

  return <div id={containerId} className="relative z-10 h-full w-full" />;
};

export default ReportIssueMapViewerDashboard;