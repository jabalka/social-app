import { IdeaProvider } from "@/context/idea-context";
import { NotificationsProvider } from "@/context/notifications-context";
import { ProjectProvider } from "@/context/project-context";
import { ProjectModalProvider } from "@/context/project-modal-context";
import { SocketProvider } from "@/context/socket-context";
import { UserProvider } from "@/context/user-context";
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
        <ThemeProviders>
          <SafeThemeProviders>
            <ToasterProvider>
              <UserProvider initialUser={null}>
                <NotificationsProvider>
                  <SocketProvider>
                    <UserDialogProvider>
                      <ConfirmationProviders>
                        <ProjectProvider>
                          <IdeaProvider>
                            <ProjectModalProvider>
                              <SidebarProviders>{children}</SidebarProviders>
                            </ProjectModalProvider>
                          </IdeaProvider>
                        </ProjectProvider>
                      </ConfirmationProviders>
                    </UserDialogProvider>
                  </SocketProvider>
                </NotificationsProvider>
              </UserProvider>
            </ToasterProvider>
          </SafeThemeProviders>
        </ThemeProviders>
      </HtmlProviders>
    </AuthProviders>
  );
};

export default Providers;
