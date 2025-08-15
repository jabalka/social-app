"use client";

import { ModalProvider } from "@/context/modal-context";
import React from "react";
import ModalOverlay from "@/components/modal-overlay";
import IdeaListOverview from "./idea-list-overview";

interface IdeaListOverviewModalProps {
  open: boolean;
  onClose: () => void;
  theme: string;
  showOwnedOnly?: boolean;
  userId?: string;
}

const IdeaListOverviewModal: React.FC<IdeaListOverviewModalProps> = ({
  open,
  onClose,
  theme,
  showOwnedOnly = false,
  userId,
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
        <IdeaListOverview showOwnedOnly={showOwnedOnly} userId={userId}/>
      </ModalProvider>
    </ModalOverlay>
  );
};

export default IdeaListOverviewModal;