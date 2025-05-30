import { SocketProvider } from "@/context/socket-context";
import React, { PropsWithChildren } from "react";
import AuthProviders from "./auth-providers";
import ConfirmationProviders from "./confirmation-providers";
import HtmlProviders from "./html-providers";
import SafeThemeProviders from "./safe-theme-providers";
import SidebarProviders from "./sidebar-providers";
import ThemeProviders from "./theme-providers";
import ToasterProviders from "./toaster-providers";

const Providers: React.FC<PropsWithChildren> = async ({ children }) => {
  return (
    <AuthProviders>
        <HtmlProviders>
      <SocketProvider>
          <ThemeProviders>
            <SafeThemeProviders>
              <ConfirmationProviders>
                <ToasterProviders>
                  <SidebarProviders>{children}</SidebarProviders>
                </ToasterProviders>
              </ConfirmationProviders>
            </SafeThemeProviders>
          </ThemeProviders>
      </SocketProvider>
        </HtmlProviders>
    </AuthProviders>
  );
};

export default Providers;
