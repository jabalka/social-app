import { SocketProvider } from "@/context/socket-context";
import { UserDialogProvider } from "@/context/user-dialog-context";
import React from "react";
import AuthProviders from "./auth-providers";
import ConfirmationProviders from "./confirmation-providers";
import HtmlProviders from "./html-providers";
import SafeThemeProviders from "./safe-theme-providers";
import SidebarProviders from "./sidebar-providers";
import ThemeProviders from "./theme-providers";
import ToasterProvider from "./toaster-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AuthProviders>
      <HtmlProviders>
        <SocketProvider>
          <UserDialogProvider>
            <ThemeProviders>
              <SafeThemeProviders>
                <ConfirmationProviders>
                  <ToasterProvider>
                    <SidebarProviders>{children}</SidebarProviders>
                  </ToasterProvider>
                </ConfirmationProviders>
              </SafeThemeProviders>
            </ThemeProviders>
          </UserDialogProvider>
        </SocketProvider>
      </HtmlProviders>
    </AuthProviders>
  );
};

export default Providers;
