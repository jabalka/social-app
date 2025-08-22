"use client";

import { ModalProvider } from "@/context/modal-context";
import React from "react";
import ModalOverlay from "./modal-overlay";
import ReportIssueListOverview from "./report-issue-list-overview";

const IssueListOverviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  theme: string;
  showOwnedOnly?: boolean;
  userId?: string;
}> = ({ open, onClose, theme, showOwnedOnly = false }) => {
  return (
    <ModalOverlay
      open={open}
      onClose={onClose}
      showCloseButton={false}
      theme={theme}
      modalWidthClasses="sm:max-w-xl md:max-w-3xl w-full"
    >
      <ModalProvider isModal={true}>
        <ReportIssueListOverview showOwnedOnly={showOwnedOnly} />
      </ModalProvider>
    </ModalOverlay>
  );
};

export default IssueListOverviewModal;
