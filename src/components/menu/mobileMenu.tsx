import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import React from "react";
import SidebarLogo from "../sidebar/sidebar-logo";
import GithubLogo from "../svg/github-logo";
import TelegramLogo from "../svg/telegram-logo";
import XTwitterLogo from "../svg/x-twitter-logo";
import YoutubeLogo from "../svg/youtube-logo";
import MenuItem, { type MenuItem as MenuItemType } from "./menu-item";

const menuItems: MenuItemType[] = [
  {
    label: "GET STARTED",
    href: "#",
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
  { label: "CONTACT", href: "/contactus/" },
];

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, toggleMenu }) => {
  const handleNavigateClick = () => {
    // Navigates to the platform page
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-[320px] transform bg-[#0A0B1A] ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } z-50 transition-transform duration-300 ease-in-out`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <SidebarLogo className="h-13 w-auto" />
          <div
            className={`flex transform items-center justify-center transition-transform duration-700 ${
              isOpen ? "rotate-180" : "-rotate-180"
            }`}
          >
            <button
              onClick={toggleMenu}
              className="text-orange-500 transition-colors hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" strokeWidth={4} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4">
          {menuItems.map((item, index) => (
            <MenuItem key={index} item={item} toggleMenu={toggleMenu} />
          ))}
          <div className="mt-auto flex items-center justify-center border-t border-gray-800 p-4">
            <button
              onClick={handleNavigateClick}
              className="flex items-center justify-center text-[#FF5C00] transition-colors hover:text-[#FF7A33]"
            >
              <span className="mr-2 text-lg font-medium">TO PLATFORM</span>
              <ChevronRight className="h-5 w-5 transform transition-transform" strokeWidth={4} />
            </button>
          </div>
          <div className="mt-4 px-4 pb-4">
            <div className="flex flex-wrap justify-center gap-4 px-4">
              <div className="flex gap-4">
                <Link
                  href="https://t.me/starckapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-12 w-12 items-center justify-center rounded-md border border-gray-800 text-gray-400 transition-colors hover:border-[#FF5C00]"
                >
                  <TelegramLogo className="fill-current text-[1.5rem] text-gray-400 transition-colors group-hover:text-[#FF5C00]" />
                </Link>
                <Link
                  href="https://twitter.com/Starckcrypto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-12 w-12 items-center justify-center rounded-md border border-gray-800 text-gray-400 transition-colors hover:border-[#FF5C00]"
                >
                  <XTwitterLogo className="fill-current text-[1.5rem] text-gray-400 transition-colors group-hover:text-[#FF5C00]" />
                </Link>
                <Link
                  href="https://medium.com/@starckcrypto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-12 w-12 items-center justify-center rounded-md border border-gray-800 text-gray-400 transition-colors hover:border-[#FF5C00]"
                >
                  <YoutubeLogo className="fill-current text-[1.5rem] text-gray-400 transition-colors group-hover:text-[#FF5C00]" />
                </Link>
                <Link
                  href="https://github.com/StarckASIP/Starck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-12 w-12 items-center justify-center rounded-md border border-gray-800 text-gray-400 transition-colors hover:border-[#FF5C00]"
                >
                  <GithubLogo className="fill-current text-[1.5rem] text-gray-400 transition-colors group-hover:text-[#FF5C00]" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* FOOTER */}
      </div>
    </div>
  );
};

export default MobileMenu;
