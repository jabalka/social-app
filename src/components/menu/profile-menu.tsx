import React from "react";
import MenuDropdownButton from "./menu-dropdown-button";
import { Theme } from "@/types/theme.enum";
import { logout } from "@/app/actions/auth-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn.utils";

interface Props {
  className?: string;
  theme: string;
}

const ProfileMenu: React.FC<Props> = ({ theme }) => {
      const router = useRouter();


      const handleLogout = async () => {
        await logout();
        // setIsLoggingOut(false);
    
        router.push("/");
      };
  return (
    <nav className={cn("w-32 min-w-max", {
                "text-zinc-700": theme === Theme.LIGHT,
                "text-zinc-200": theme === Theme.DARK,
    })}>
      <ul className="flex items-center justify-center whitespace-nowrap">
        <MenuDropdownButton
          label="HOME"
          items={[
            { href: "/what-is-starck", label: "CREATE PROJECT" },
            { href: "/faq", label: "SHARE IDEA" },
            { href: "/faq", label: "REPORT ISSUE" },
          ]}
          theme={theme}
        />

<button
          onClick={() => handleLogout}
          className="group relative flex items-center space-x-2 focus:outline-none"
        >
          <span
            className={cn(`text-sm font-medium transition-transform duration-300 sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg hover:text-[#FF5C00] `)}
          >
            Logout
          </span>

        </button>
      </ul>
    </nav>
  );
};



export default ProfileMenu;
