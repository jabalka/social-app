"use client";
import { MESSAGES, TOASTER_DURATION_MS } from "@/constants";
import { useSessionToast } from "@/hooks/use-session-toast";
import React, { PropsWithChildren, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    toast: typeof toast;
  }
}

const ToasterProviders: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    window.toast = toast;
  }, []);
  // Show Idea Draft toast if sessionStorage flag is set.,
  // only needs to set the flag before navigation e.g. sessionStorage.setItem("showIdeaDraftToast", "true");
  // Show Idea Draft toast if sessionStorage flag is set
  useSessionToast("showIdeaDraftToast", MESSAGES.IDEA_DRAFT_SAVED, {
    action: {
      label: "Go Back",
      onClick: () => router.push("/share-idea")
    },
    id: "idea-draft-toast"
  });
  
  useSessionToast("showProjectDraftToast", MESSAGES.PROJECT_DRAFT_SAVED, {
    action: {
      label: "Go Back",
      onClick: () => router.push("/create-project")
    },
    id: "project-draft-toast"
  });

  useSessionToast("showIssueReportDraftToast", MESSAGES.ISSUE_REPORT_DRAFT_SAVED, {
    action: {
      label: "Go Back",
      onClick: () => router.push("/report")
    },
    id: "issue-report-draft-toast"
  });
  
  // Needs to connect the logic to open the Reported-Issue Modal and the details to the certain one
  // Success toast for issue report submissions
  useSessionToast("showIssueReportSuccess", 
    (title) => `Your issue "${title}" has been successfully reported`, 
    {
      action: {
        label: "View Issues",
        onClick: () => router.push("/browse/issues-list")
      },
      id: "issue-report-success-toast"
    }
  );
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
