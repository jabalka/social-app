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

  // IDEA TOASTS
  useSessionToast("showIdeaDraftToast", MESSAGES.IDEA_DRAFT_SAVED, {
    action: {
      label: "Go Back",
      onClick: () => router.push("/share-idea")
    },
    id: "idea-draft-toast"
  });

  useSessionToast(
    "showIdeaCreateErrorToast", 
    (errorMessage) => errorMessage || MESSAGES.IDEA_CREATE_ERROR, 
    {
      action: {
        label: "Try Again",
        onClick: () => {
          // This will clear the error toast and let the user try again
          sessionStorage.removeItem("showIdeaCreateErrorToast");
          // Maybe I should get rid of the button!
          router.push("/share-idea");
        }
      },
      id: "idea-create-error-toast"
    }
  );

  useSessionToast(
    "showIdeaCreateSuccess", 
    (errorMessage) => errorMessage || MESSAGES.IDEA_CREATE_SUCCESS, 
    {
      action: {
        label: "View Idea",
        onClick: () => {
          const ideaId = sessionStorage.getItem("lastCreatedItemId");
          sessionStorage.removeItem("lastCreatedItemId");
          sessionStorage.removeItem("showIdeaCreateSuccess");
          // We need to accept an argument with the newly created idea!!!
          router.push(ideaId ? `/browse/idea/${ideaId}` : "/browse/ideas-list");
        }
      },
      id: "idea-create-success-toast"
    }
  );
  // ********************END IDEA TOASTS
  
    // PROJECT TOASTS
  useSessionToast("showProjectDraftToast", MESSAGES.PROJECT_DRAFT_SAVED, {
    action: {
      label: "Go Back",
      onClick: () => router.push("/create-project")
    },
    id: "project-draft-toast"
  });

  useSessionToast(
    "showProjectErrorToast", 
    (errorMessage) => errorMessage || MESSAGES.PROJECT_CREATE_ERROR, 
    {
      action: {
        label: "Try Again",
        onClick: () => {
          // This will clear the error toast and let the user try again
          sessionStorage.removeItem("showProjectCreateError");
          // router.push("/browse/projects");
        }
      },
      id: "project-create-error-toast"
    }
  );

  useSessionToast(
    "showProjectCreateSuccess", 
    (errorMessage) => errorMessage || MESSAGES.PROJECT_CREATE_SUCCESS, 
    {
      action: {
        label: "View Project",
        onClick: () => {
          const projectId = sessionStorage.getItem("lastCreatedItemId");
          sessionStorage.removeItem("lastCreatedItemId");
          sessionStorage.removeItem("showProjectCreateSuccess");
          // We need to accept an argument with the newly created idea!!!
          router.push(projectId ? `/browse/project/${projectId}` : "/browse/projects-list");
        }
      },
      id: "project-create-success-toast"
    }
  );

  // No needed for now, but can be used in the future
  // useSessionToast(
  //   "showProjectUpdateSuccess", 
  //   (errorMessage) => errorMessage || MESSAGES.PROJECT_UPDATE_SUCCESS, 
  //   {
  //     action: undefined,
  //     id: "project-update-success-toast"
  //   }
  // );

  // ********************END PROJECT TOASTS

  // ISSUE TOASTS
  useSessionToast("showIssueReportDraftToast", MESSAGES.ISSUE_REPORT_DRAFT_SAVED, {
    action: {
      label: "Go Back",
      onClick: () => router.push("/report")
    },
    id: "issue-report-draft-toast"
  });

  useSessionToast(
    "showIssueReportErrorToast", 
    (errorMessage) => errorMessage || MESSAGES.ISSUE_REPORT_CREATE_ERROR, 
    {
      action: {
        label: "Try Again",
        onClick: () => {
          // This will clear the error toast and let the user try again
          sessionStorage.removeItem("showIssueReportErrorToast");
          // router.push("/browse/projects");
        }
      },
      id: "project-create-error-toast"
    }
  );
  
  // Needs to connect the logic to open the Reported-Issue Modal and the details to the certain one
  // Success toast for issue report submissions
  useSessionToast("showIssueReportSuccess", 
    (title) => `Your issue "${title}" has been successfully reported`, 
    {
      action: {
        label: "View Issues",
        onClick: () => {
          const issueId = sessionStorage.getItem("lastCreatedItemId");
          sessionStorage.removeItem("lastCreatedItemId");
          sessionStorage.removeItem("showIssueReportSuccess");

          router.push(issueId ? `/browse/issue/${issueId}` : "/browse/issues-list");
        }
      },
      id: "issue-report-success-toast"
    }
  );
  // ********************END ISSUE TOASTS

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
