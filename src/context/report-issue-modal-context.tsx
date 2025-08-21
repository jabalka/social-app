"use client";

import ReportIssueDetailsDialog from "@/components/report-issue-details-dialog";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { ReportIssueReport } from "@/models/report-issue.types";
import React, { createContext, useCallback, useContext, useState } from "react";

type Ctx = {
  openIssueModal: (reportIssueId: string) => Promise<void>;
};

const IssueModalContext = createContext<Ctx | null>(null);

export const ReportIssueModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [reportIssue, setReportIssue] = useState<ReportIssueReport | null>(null);
  const { theme } = useSafeThemeContext();
  const { user } = useSafeUser();

  const openIssueModal = useCallback(async (issueId: string) => {
    const res = await fetch(`/api/issues/${issueId}`);
    const data = (await res.json()) as ReportIssueReport;
    setReportIssue(data);
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setReportIssue(null);
  };

  return (
    <IssueModalContext.Provider value={{ openIssueModal }}>
      {children}
      {reportIssue && user && (
        <ReportIssueDetailsDialog
          open={open}
          onClose={handleClose}
          reportIssue={reportIssue}
          user={user}
          theme={theme}
        />
      )}
    </IssueModalContext.Provider>
  );
};

export const useReportIssueModal = () => {
  const ctx = useContext(IssueModalContext);
  if (!ctx) throw new Error("useReportIssueModal must be used within IssueModalProvider");
  return ctx;
};
