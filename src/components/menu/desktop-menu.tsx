"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import DropdownItem from "../menu-dropdown-item";

interface Props {
  theme: string;
}

const DesktopMenu: React.FC<Props> = ({ theme }) => {
  // const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    console.log("pathname:", pathname);
  }, [pathname]);

  const isPathMatch = (menuKey: string): boolean => {
    const pathMap: Record<string, string[]> = {
      home: ["/dashboard"],
      getStarted: ["/create-project", "/share-idea", "/report"],
      about: ["/about", "/about/what-is-it", "/about/faq", "/about/contact"],
      // Add more if needed
    };
    const paths = pathMap[menuKey] || [];
    return paths.some((p) => pathname.startsWith(p));
  };
  // const handleLogout = async () => {
  //   await logout();
  //   router.push("/");
  // };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLabelStyle = (menuKey: string) =>{
    const base =
      "text-sm font-medium transition-colors duration-200 sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg";
  
    const isActive = openMenu === menuKey || isPathMatch(menuKey);
  
    const active = "text-[#FF5C00]";
    const inactive =
      theme === Theme.LIGHT
        ? "text-zinc-700 group-hover:text-[#FF5C00]"
        : "text-zinc-200 group-hover:text-[#FF5C00]";
  
    return cn(base, isActive ? active : inactive);
  };

  return (
    <nav
      className={cn("w-full min-w-max", {
        "text-zinc-700": theme === Theme.LIGHT,
        "text-zinc-200": theme === Theme.DARK,
      })}
    >
      <ul
        className="flex items-center justify-center gap-x-5 whitespace-nowrap md:gap-x-5 lg:gap-x-6 xl:gap-x-7"
        ref={menuRef}
      >
        {/* HOME (non-dropdown) */}
        <li className="group relative">
          <Link href="/dashboard" className="group relative flex items-center">
            <span className={getLabelStyle("home")}>HOME</span>
          </Link>
        </li>

        {/* GET STARTED */}
        <li
          className="group relative"
          onMouseEnter={() => setOpenMenu("getStarted")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            onClick={() => setOpenMenu((prev) => (prev === "getStarted" ? null : "getStarted"))}
            className="group relative flex items-center space-x-[2px] focus:outline-none"
          >
            <span className={getLabelStyle("getStarted")}>GET STARTED</span>
            <ChevronDown
              className={cn("ml-2 h-4 w-4 transition-transform duration-300", {
                "rotate-180 text-[#FF5C00]": openMenu === "getStarted",
                "text-zinc-700 group-hover:text-[#FF5C00]": openMenu !== "getStarted" && theme === Theme.LIGHT,
                "text-zinc-200 group-hover:text-[#FF5C00]": openMenu !== "getStarted" && theme === Theme.DARK,
              })}
            />
          </button>

          {openMenu === "getStarted" && (
            <div className="absolute top-1 z-[1] sm:top-1 md:top-4 lg:top-5 xl:top-6">
              <div
                className={cn("flex flex-col rounded-md shadow-lg", {
                  "bg-[#443d3a]": theme === Theme.DARK,
                  "bg-[#eeded7]": theme === Theme.LIGHT,
                })}
              >
                <DropdownItem href="/create-project" className="px-3 py-1.5">
                  <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">CREATE PROJECT</span>
                </DropdownItem>
                <DropdownItem href="/share-idea" className="px-3 py-1.5">
                  <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">SHARE IDEA</span>
                </DropdownItem>
                <DropdownItem href="/report" className="px-3 py-1.5">
                  <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">REPORT ISSUE</span>
                </DropdownItem>
              </div>
            </div>
          )}
        </li>

        {/* ABOUT */}
        <li className="group relative" onMouseEnter={() => setOpenMenu("about")} onMouseLeave={() => setOpenMenu(null)}>
          <button
            onClick={() => setOpenMenu((prev) => (prev === "about" ? null : "about"))}
            className="group relative flex items-center space-x-[2px] focus:outline-none"
          >
            <span className={getLabelStyle("about")}>ABOUT</span>
            <ChevronDown
              className={cn("ml-2 h-4 w-4 transition-transform duration-300", {
                "rotate-180 text-[#FF5C00]": openMenu === "about",
                "text-zinc-700 group-hover:text-[#FF5C00]": openMenu !== "about" && theme === Theme.LIGHT,
                "text-zinc-200 group-hover:text-[#FF5C00]": openMenu !== "about" && theme === Theme.DARK,
              })}
            />
          </button>

          {openMenu === "about" && (
            <div className="absolute top-5 z-[1] sm:top-1 md:top-4 lg:top-5 xl:top-6">
              <div
                className={cn("flex flex-col rounded-md shadow-lg", {
                  "bg-[#443d3a]": theme === Theme.DARK,
                  "bg-[#eeded7]": theme === Theme.LIGHT,
                })}
              >
                <DropdownItem href="/about/what-is-it" className="px-3 py-1.5">
                  <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">What is CivilDev</span>
                </DropdownItem>
                <DropdownItem href="/about/faq" className="px-3 py-1.5">
                  <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">FAQ</span>
                </DropdownItem>
                <DropdownItem href="/about/contact" className="px-3 py-1.5">
                  <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">CONTACT</span>
                </DropdownItem>
              </div>
            </div>
          )}
        </li>

        {/* PROFILE
        <li
          className="group relative "
          onMouseEnter={() => setOpenMenu("profile")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            onClick={() => setOpenMenu((prev) => (prev === "profile" ? null : "profile"))}
            className="group relative flex items-center space-x-[2px] focus:outline-none"
          >
            <span className={getLabelStyle("profile")}>PROFILE</span>
            <ChevronDown
              className={cn("ml-2 h-4 w-4 transition-transform duration-300", {
                "rotate-180 text-[#FF5C00]": openMenu === "profile",
                "text-zinc-700 group-hover:text-[#FF5C00]": openMenu !== "profile" && theme === Theme.LIGHT,
                "text-zinc-200 group-hover:text-[#FF5C00]": openMenu !== "profile" && theme === Theme.DARK,
              })}
            />
          </button>

          {openMenu === "profile" && (
            <div className="absolute right-0 top-5 z-[1] sm:top-1 md:top-4 lg:top-5 xl:top-6">
              <div
                className={cn("flex flex-col rounded-md shadow-lg", {
                  "bg-[#443d3a]": theme === Theme.DARK,
                  "bg-[#eeded7]": theme === Theme.LIGHT,
                })}
              >
                <DropdownItem href="/profile/dashboard" className="flex items-center justify-between px-4 py-2">
                  <User className="mr-2 h-5 w-5" />
                  <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">ACCOUNT</span>
                </DropdownItem>
                <DropdownItem
                  href="/your-list"
                  className="flex items-center justify-between border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
                >
                  <List className="mr-2 h-5 w-5" />
                  <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">YOUR LISTS</span>
                </DropdownItem>
                <button
                  onClick={(e) => {
                    e.currentTarget.blur();
                    handleLogout();
                  }}
                  className="flex items-center justify-between border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
                >
                  <LogOut className="ml-1 mr-2 h-5 w-5" />
                  <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">SIGN OUT</span>
                </button>
              </div>
            </div>
          )}
        </li> */}
      </ul>
    </nav>
  );
};

export default DesktopMenu;
