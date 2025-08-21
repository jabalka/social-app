"use client";

import { ReportIssueReport } from "@/models/report-issue.types";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type FetchType = "all" | "user";

type RefreshParams = {
  page: number;
  limit: number;
  type: FetchType;
  ownerId?: string;
  sort?: "newest" | "oldest" | "priority" | "status";
  lat?: number;
  lng?: number;
  radius?: number;
  status?: string;
  priority?: string;
  issueType?: string;
};

type Ctx = {
  reportIssues: ReportIssueReport[] | null;
  loading: boolean;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize: number;
  totalReportIssues: number;
  refreshReportIssues: (p: RefreshParams) => Promise<void>;
};

const ReportIssueContext = createContext<Ctx | null>(null);

export const ReportIssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reportIssues, setReportIssues] = useState<ReportIssueReport[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReportIssues, setTotalReportIssues] = useState(0);
  const [pageSize] = useState(6);

  const refreshReportIssues = useCallback(async (params: RefreshParams) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("page", String(params.page));
      query.set("limit", String(params.limit));
      if (params.type) query.set("type", params.type);
      if (params.ownerId) query.set("ownerId", params.ownerId);
      if (params.sort) query.set("sort", params.sort);
      if (params.lat !== undefined && params.lng !== undefined) {
        query.set("lat", String(params.lat));
        query.set("lng", String(params.lng));
      }
      if (params.radius !== undefined) query.set("radius", String(params.radius));
      if (params.status) query.set("status", params.status);
      if (params.priority) query.set("priority", params.priority);
      if (params.issueType) query.set("issueType", params.issueType);

      const res = await fetch(`/api/issues?${query.toString()}`);
      const data = await res.json();
      setReportIssues(data.issues || []);         
      setTotalReportIssues(data.totalCount || 0);  
    } catch {
      setReportIssues([]);
      setTotalReportIssues(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ reportIssues, loading, currentPage, setCurrentPage, pageSize, totalReportIssues, refreshReportIssues }),
    [reportIssues, loading, currentPage, pageSize, totalReportIssues, refreshReportIssues],
  );

  return <ReportIssueContext.Provider value={value}>{children}</ReportIssueContext.Provider>;
};

export const useReportIssueContext = () => {
  const ctx = useContext(ReportIssueContext);
  if (!ctx) throw new Error("useReportIssueContext must be used within IssueProvider");
  return ctx;
};