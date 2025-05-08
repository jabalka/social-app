// "use client";

// import { Theme } from "@/types/theme.enum";
// import { cn } from "@/utils/cn.utils";
// import { Headphones } from "lucide-react";
// import React from "react";
// import Ripple from "../ripple";


// interface Props {
//   theme: string;
//   sidebarExpanded: boolean;
// }

// const SidebarSupport: React.FC<Props> = ({ theme }) => {

//   return (
//     <>
//       <div
//         className={cn("border-t p-4", {
//           "border-zinc-200": theme === Theme.LIGHT,
//           "border-zinc-700": theme === Theme.DARK,
//         })}
//       >
//         <div className="flex flex-col items-center gap-4">
//           <button
//             type="button"
//             onClick={() => setGetInTouchDialogOpen(true)}
//             className="relative rounded-full border-2 border-[#ff6913] p-3"
//           >
//             <Headphones className="h-4 w-4 text-[#ff6913]" />
//             <Ripple className="rounded-full" />
//           </button>
//         </div>
//       </div>

//     </>
//   );
// };

// export default SidebarSupport;
