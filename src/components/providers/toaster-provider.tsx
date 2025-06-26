"use client";
import { MESSAGES, TOASTER_DURATION_MS } from "@/constants";
import { useSessionToast } from "@/hooks/use-session-toast";
import React, { PropsWithChildren, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

declare global {
  interface Window {
    toast: typeof toast;
  }
}

const ToasterProviders: React.FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    window.toast = toast;
  }, []);
  // Show Idea Draft toast if sessionStorage flag is set.,
  // only needs to set the flag before navigation e.g. sessionStorage.setItem("showIdeaDraftToast", "true");
  useSessionToast("showIdeaDraftToast", MESSAGES.IDEA_DRAFT_SAVED, "idea-draft-toast");
  useSessionToast("showProjectDraftToast", MESSAGES.PROJECT_DRAFT_SAVED, "project-draft-toast");

  return (
    <>
      {children}
      <Toaster
        position="top-left"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          style: {
            fontSize: "0.875rem",
            minWidth: 320,
            maxWidth: 400,
            borderRadius: "0.5rem",
            background: "#232324",
            color: "#fff",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          },
          duration: TOASTER_DURATION_MS,
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
};

export default ToasterProviders;
