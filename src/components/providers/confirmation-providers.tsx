import { ConfirmationModal } from "@/components/confirmation-modal";
import { ConfirmationProvider } from "@/context/confirmation-context";
import React, { PropsWithChildren } from "react";

const ConfirmationProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ConfirmationProvider>
      {children}
      <ConfirmationModal />
    </ConfirmationProvider>
  );
};

export default ConfirmationProviders;
