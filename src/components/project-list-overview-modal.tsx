"use client";

import { ModalProvider } from "@/context/modal-context";
import React from "react";
import ModalOverlay from "./modal-overlay";
import ProjectListOverview from "./projects-list-overview";

interface ProjectListOverviewModalProps {
  open: boolean;
  onClose: () => void;
  theme: string;
  showOwnedOnly?: boolean;
  userId?: string;
}

const ProjectListOverviewModal: React.FC<ProjectListOverviewModalProps> = ({
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
        <ProjectListOverview showOwnedOnly={showOwnedOnly} userId={userId} />
      </ModalProvider>
    </ModalOverlay>
  );
};

export default ProjectListOverviewModal;
