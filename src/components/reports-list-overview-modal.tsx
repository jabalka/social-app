"use client";

import { ModalProvider } from "@/context/modal-context";
import React from "react";
import ModalOverlay from "@/components/modal-overlay";

interface Props {
  open: boolean;
  onClose: () => void;
  theme: string;
  showOwnedOnly?: boolean;
  userId?: string;
}

/**
 * Placeholder modal for reported issues.
 * Replace the inner content with your real Issues/Reports overview when ready.
 */
const ReportsListOverviewModal: React.FC<Props> = ({
  open,
  onClose,
  theme,
}) => {
  return (
    <ModalOverlay
      open={open}
      onClose={onClose}
      showCloseButton={false}
      theme={theme}
      modalWidthClasses="sm:max-w-xl md:max-w-3xl w-full"
    >
      <ModalProvider isModal={true}>
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="opacity-80">Reported Issues coming soon…</p>
        </div>
      </ModalProvider>
    </ModalOverlay>
  );
};

export default ReportsListOverviewModal;