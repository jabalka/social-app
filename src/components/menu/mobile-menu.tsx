import { logout } from "@/app/actions/auth-actions";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { ChevronRight, LogOut, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import LogoutLoader from "../common/logoutLoader";
// import { SafeUser } from "../layouts/layout-client";
import SidebarLogoBlack from "../site-logo-black";
import SidebarLogoWhite from "../site-logo-white";
import GithubLogo from "../svg/github-logo";
import TelegramLogo from "../svg/telegram-logo";
import XTwitterLogo from "../svg/x-twitter-logo";
import YoutubeLogo from "../svg/youtube-logo";
import MenuItem, { MobileMenuItem } from "./mobile-menu-item";
import { AuthUser } from "@/models/auth";

const menuItems: MobileMenuItem[] = [
  {
    label: "GET STARTED",
    hasDropdown: true,
    subItems: [
      { label: "What is Starck", href: "/What-is-Starck/" },
      { label: "FAQ", href: "/faq/" },
      { label: "Registration", href: "/registration/" },
    ],
  },
  { label: "ASIP BY STARCK", href: "/asipByStarck/" },
  {
    label: "STAKE STARCK",
    href: "/stake-starck/",
    hasDropdown: true,
    subItems: [{ label: "Stake packages", href: "/Stake-Packages/" }],
  },
  {
    label: "DOCUMENTS",
    href: "#",
    hasDropdown: true,
    subItems: [
      { label: "Whitepaper", href: "https://starck.gitbook.io/starck-whitepaper-v.3.0/" },
      { label: "Roadmap", href: "/#roadmap" },
      { label: "Smart contract", href: "https://bscscan.com/address/0xa35b5c783117e107644056f5d39faa468e9d8d47#code" },
      { label: "Audits", href: "/audits/" },
    ],
  },
  {
    label: "PROGRAM",
    href: "#",
    hasDropdown: true,
    subItems: [
      { label: "Ambassador", href: "/ambassadors/" },
      { label: "Affiliate", href: "/affiliate/" },
      { label: "Partners", href: "/partners/" },
    ],
  },
  {
    label: "NEWS",
    href: "/news/medium/",
    hasDropdown: true,
    subItems: [{ label: "Media Sources", href: "/news/media/" }],
  },
  { label: "PROFILE", href: "/contactus/", icon: <User className="h-5 w-5" /> },
];

interface MobileMenuProps {
  user: AuthUser | null;
  isOpen: boolean;
  toggleMenu: () => void;
  theme: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, toggleMenu, theme }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        toggleMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleMenu]);

  const handleNavigateClick = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    toggleMenu();
    router.push("/");
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMenu} />}
      {isLoggingOut ? (
        <LogoutLoader />
      ) : (
        <div
          ref={menuRef}
          className={cn(
            "fixed right-0 top-0 z-50 h-full w-[320px] transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "translate-x-full",
            {
              "border-zinc-300 bg-gradient-to-r from-[#fbe8e0] via-[#dfc9bf] to-[#c8b3aa] text-zinc-700":
                theme === Theme.LIGHT,
              "border-zinc-700 bg-gradient-to-r from-[#6f635e] via-[#443d3a] to-[#443d3a] text-zinc-200":
                theme === Theme.DARK,

              //  {
              //   "text-zinc-700": theme === Theme.LIGHT,
              //   "text-zinc-200": theme === Theme.DARK,
              // }
            },
          )}
        >
          <div className="absolute -left-px bottom-0 top-0 w-0.5 bg-[#2b2725]" />

          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-[#2b2725] px-4">
              {theme === Theme.DARK ? (
                <SidebarLogoWhite size={246} className="relative left-0 w-auto" />
              ) : (
                <SidebarLogoBlack size={246} className="relative left-0 w-auto" />
              )}
              <div
                className={`flex transform items-center justify-center transition-transform duration-700 ${
                  isOpen ? "rotate-180" : "-rotate-180"
                }`}
              >
                <button onClick={toggleMenu} className="transition-colors hover:text-[#FF5C00]" aria-label="Close menu">
                  <X className="h-6 w-6" strokeWidth={4} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-4">
                {menuItems.map((item, index) => (
                  <MenuItem
                    theme={theme}
                    key={index}
                    item={item}
                    toggleMenu={toggleMenu}
                    isOpen={openSubmenu === index}
                    onToggle={() => setOpenSubmenu(openSubmenu === index ? null : index)}
                  />
                ))}
              </div>

              <div className="mt-auto pt-12">
                <div className="flex items-center justify-center p-4">
                  <button
                    onClick={handleNavigateClick}
                    className="flex items-center justify-center text-[#FF5C00] transition-colors hover:text-[#ffffff]"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    <span className="mr-2 text-lg font-medium">LOGOUT</span>
                    <ChevronRight className="h-5 w-5" strokeWidth={4} />
                  </button>
                </div>
                <div className="px-4 pb-4">
                  <div className="flex justify-center gap-4">
                    <Link
                      href="https://t.me/starckapp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-md border border-[#bda69c] transition-colors hover:border-[#FF5C00] hover:text-[#FF5C00]"
                    >
                      <TelegramLogo className="text-[1.5rem]" />
                    </Link>
                    <Link
                      href="https://twitter.com/Starckcrypto"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-md border border-[#bda69c] transition-colors hover:border-[#FF5C00] hover:text-[#FF5C00]"
                    >
                      <XTwitterLogo className="text-[1.5rem]" />
                    </Link>
                    <Link
                      href="https://medium.com/@starckcrypto"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-md border border-[#bda69c] transition-colors hover:border-[#FF5C00] hover:text-[#FF5C00]"
                    >
                      <YoutubeLogo className="text-[1.5rem]" />
                    </Link>
                    <Link
                      href="https://github.com/StarckASIP/Starck"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-md border border-[#bda69c] transition-colors hover:border-[#FF5C00] hover:text-[#FF5C00]"
                    >
                      <GithubLogo className="text-[1.5rem]" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
