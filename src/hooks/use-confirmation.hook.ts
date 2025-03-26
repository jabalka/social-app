"use client";

import { ConfirmationContext } from "@/context/confirmation-context";
import { useContext } from "react";

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (context === undefined) {
    throw new Error("useConfirmation must be used within a ConfirmationProvider");
  }
  return context;
}
