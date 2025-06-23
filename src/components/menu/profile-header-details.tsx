"use client";

import { useSafeUser } from "@/context/user-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Home, List, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import DefaultAvatar from "public/images/default-avatar.png";
import React, { useEffect, useState } from "react";
import DropdownItem from "../menu-dropdown-item";

interface Props {
  theme: string;
  className?: string;
  forceClickDropdown?: boolean;
  variant?: "desktop" | "profile";
}

const ProfileHeaderDetails: React.FC<Props> = ({ theme, className, forceClickDropdown, variant }) => {
  const isDark = theme === Theme.DARK;
  const { user } = useSafeUser();


  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [forceClickDropdown]);

  const handleLogout = () => {
    setDropdownOpen(false);
    signOut();
  };

  const displayName = user?.name?.trim() || user?.username?.trim() || user?.email;

  return (
    <div ref={dropdownRef} className={cn("flex items-center gap-3", { "text-zinc-400": isDark }, className)}>
      <span className="hidden md:block">{displayName}</span>

      <div
        className={cn("group relative flex cursor-pointer items-center space-x-1")}
        onClick={() => {
          if (forceClickDropdown) {
            setDropdownOpen((prev) => !prev);
          }
        }}
        onMouseEnter={() => {
          if (!forceClickDropdown) {
            setDropdownOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (!forceClickDropdown) {
            setDropdownOpen(false);
          }
        }}
      >
        {/* Avatar */}
        <div className="relative inline-flex overflow-hidden rounded-full p-[4px]">
          <div
            className={cn(
              "relative rounded-full outline outline-2 outline-offset-[2px] outline-white transition-all duration-300",
              isDark ? "bg-[#6f6561c4] hover:outline-[#3c2f27]" : "bg-[#bda69c66] hover:outline-[#3c2f27]",
              {
                // DESKTOP hover effect
                "bg-[#6f6561c4] hover:outline-[#3c2f27]": isDark && !forceClickDropdown,
                "bg-[#bda69c66] hover:outline-[#3c2f27]": !isDark && !forceClickDropdown,
              },
              {
                // MOBILE clicked effect
                "bg-[#6f6561c4] outline-[#3c2f27]": isDark && forceClickDropdown && dropdownOpen,
                "bg-[#bda69c66] outline-[#3c2f27]": !isDark && forceClickDropdown && dropdownOpen,
              },
            )}
          >
            <Image
              src={user?.image ?? DefaultAvatar}
              alt="User Avatar"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          {/* 
          {
                "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
                "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
              }
               */}
          <span
            className={cn("pointer-events-none absolute inset-0 rounded-full",     {
              "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
              "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
              "animate-snakeBorderHoverLight": forceClickDropdown && dropdownOpen && theme === Theme.LIGHT,
              "animate-snakeBorderHoverDark": forceClickDropdown && dropdownOpen && theme === Theme.DARK,
            })}
          />
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-10 z-10 transition-all duration-200">
            <div
              className={cn("flex min-w-[180px] flex-col rounded-md shadow-lg", {
                "bg-[#443d3a] text-white": isDark,
                "bg-[#eeded7] text-zinc-800": !isDark,
              })}
            >
              {variant === "desktop" ? (
                <>
              <DropdownItem
                href="/profile/dashboard"
                className="flex items-center justify-between border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <User className="h-5 w-5" />
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">PROFILE</span>
              </DropdownItem>

              <DropdownItem
                href="/dashboard"
                className="flex items-center justify-between border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <List className="h-5 w-5" />
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">YOUR LISTS</span>
              </DropdownItem>
                </>
              ) : (
                <>
              <DropdownItem
                href="/dashboard"
                className="flex items-center justify-between border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <Home className="h-5 w-5" />
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">BACK HOME</span>
              </DropdownItem>
                </>
              )}


              <button
                onClick={() => {
                  setDropdownOpen(false);
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
      </div>
    </div>
  );
};

export default ProfileHeaderDetails;
