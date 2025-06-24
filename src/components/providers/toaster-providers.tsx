
import { TOASTER_DURATION_MS } from "@/constants";
import React, { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";

const ToasterProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
 {children}
      <Toaster
        position="top-center" // You can use: top-right, top-center, top-left, bottom-right, bottom-center, bottom-left
        reverseOrder={false}
        gutter={8} // space between toasts
        toastOptions={{
          // Default toast styles
          style: {
            fontSize: "0.875rem",
            minWidth: 320,
            maxWidth: 400,
            borderRadius: "0.5rem",
            background: "#232324",  // Or match your theme
            color: "#fff",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            marginTop: "60px", // Space from top (e.g., for a fixed menu)
          },
          duration: TOASTER_DURATION_MS,
          // Success/Custom/Error styles
          success: {
            iconTheme: {
              primary: "#10b981", // Tailwind green-500
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444", // Tailwind red-500
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
};

export default ToasterProviders;
