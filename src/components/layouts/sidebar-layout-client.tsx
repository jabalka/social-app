// "use client";


// import { useSidebarContext } from "@/context/sidebar-context";
// import { User } from "@prisma/client";
// import { usePathname } from "next/navigation";
// import React, { PropsWithChildren, useEffect } from "react";
// import Sidebar from "../sidebar";
// import { cn } from "@/utils/cn.utils";
// import HeaderClient from "../header-client";
// import { Theme } from "@/types/theme.enum";
// import { useSafeThemeContext } from "@/context/safe-theme-context";
// import Footer from "../footer";

// const PATHS_WITH_CHAT_INTERFACE = [
//   "/platform/manage/affiliate-applications/",
//   "/platform/manage/ambassador-applications/",
//   "/platform/manage/contact-messages/",
//   "/platform/manage/standalone-messages/",
//   "/platform/manage/partner-applications/",
// ];

// interface Props {
//   user: User | null;
// }

// const SidebarLayoutClient: React.FC<PropsWithChildren<Props>> = ({ user, children }) => {
//   const { theme } = useSafeThemeContext();
//   const { sidebarExpanded, setSidebarExpanded } = useSidebarContext();
//   const pathname = usePathname();
//   const withChatInterface = PATHS_WITH_CHAT_INTERFACE.some((path) => pathname.startsWith(path));

//   useEffect(() => {
//     if (window.innerWidth <= 768) {
//       setSidebarExpanded(false);
//     }
//   }, [pathname, setSidebarExpanded]);

//   return (
//     <div className="flex">
//       <Sidebar
//         user={user}
//         theme={theme}
//         sidebarExpanded={sidebarExpanded}
//         className={cn("fixed inset-0 z-10 transition-transform md:static md:min-h-screen md:transition-none", {
//           "-translate-x-full md:translate-x-0": !sidebarExpanded,
//         })}
//       />

//       <div
//         className={cn("flex min-h-screen flex-1 flex-col", {
//           "h-screen": withChatInterface,
//         })}
//       >
//         <HeaderClient
//           user={user}
//           onToggle={() => setSidebarExpanded((currentSidebarExpanded) => !currentSidebarExpanded)}
//         />

//         <main
//           className={cn("flex flex-1 flex-col gap-6 p-6", {
//             "bg-gradient-to-br from-slate-200 via-indigo-50 to-slate-200": theme === Theme.LIGHT,
//             "bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900": theme === Theme.DARK,
//             "min-h-0 p-0": withChatInterface,
//           })}
//         >
//           {children}
//         </main>

//         {!withChatInterface && <Footer theme={theme} />}
//       </div>
//     </div>
//   );
// };

// export default SidebarLayoutClient;
