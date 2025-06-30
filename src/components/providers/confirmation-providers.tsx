import { ConfirmationProvider } from "@/context/confirmation-context";
import React, { PropsWithChildren } from "react";
import ConfirmationModal from "../confirmation-modal";

const ConfirmationProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ConfirmationProvider>
      {children}
      <ConfirmationModal />
    </ConfirmationProvider>
  );
};

export default ConfirmationProviders;
