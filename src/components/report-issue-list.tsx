"use client";

import { useModalContext } from "@/context/modal-context";
import { ReportIssueReport } from "@/models/report-issue.types";
import { cn } from "@/utils/cn.utils";
import React from "react";
import ReportIssueCard from "./report-issue-card";
import ReportIssueCardSkeleton from "./report-issue-card-skeleton";

interface ReportIssueListProps {
  issues: ReportIssueReport[];
  theme: string;
  loading: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const ReportIssueList: React.FC<ReportIssueListProps> = ({ issues, theme, loading, selectedId, onSelect }) => {
  const { isInModal } = useModalContext();

  return (
    <div
      className={cn("nf-scrollbar space-y-6 overflow-y-auto px-2", {
        "max-h-[600px]": !isInModal,
        "max-h-[calc(70vh-150px)]": isInModal,
      })}
    >
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <ReportIssueCardSkeleton key={i} />)
      ) : !issues || issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        issues.map((issue) => (
          <ReportIssueCard
            key={issue.id}
            issue={issue}
            theme={theme}
            selected={selectedId === issue.id}
            onSelect={() => onSelect?.(issue.id)}
          />
        ))
      )}
    </div>
  );
};

export default ReportIssueList;
