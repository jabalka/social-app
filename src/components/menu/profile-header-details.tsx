"use client";

import { AuthUser } from "@/models/auth";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { CircleUserRound, Home, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import DropdownItem from "../menu-dropdown-item";

interface Props {
  theme: string;
  user: AuthUser;
  className?: string;
}

const ProfileHeaderDetails: React.FC<Props> = ({ theme, user, className }) => {
  const isDark = theme === Theme.DARK;
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

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    signOut();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        {
          "text-zinc-400": theme === Theme.DARK,
        },
        className,
      )}
    >
      <span className="hidden md:block">{user.name ?? user.email ?? user.username}</span>

      {/* Avatar trigger */}
      <div ref={dropdownRef} className="relative flex cursor-pointer items-center space-x-1">
        <div className="group relative inline-flex overflow-hidden rounded-full p-[4px]">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={cn("relative rounded-full outline outline-2 outline-offset-[2px] outline-white transition-all duration-300 hover:outline hover:outline-2",
              isDark ? "bg-[#6f6561c4] hover:outline-[#3c2f27]" : "bg-[#bda69c66] hover:outline-[#3c2f27]",
            )}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full ring-[#ff6913]"
              />
            ) : (
              <CircleUserRound className="h-9 w-9" />
            )}
          </button>

          {/* Glowing animated border */}
          <span key={animationKey} className="pointer-events-none absolute inset-0 rounded-full group-hover:animate-snakeBorderHover" />
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-10 z-10">
            <div
              className={cn("flex min-w-[160px] flex-col rounded-md shadow-lg", {
                "bg-[#443d3a] text-white": theme === Theme.DARK,
                "bg-[#eeded7] text-zinc-800": theme === Theme.LIGHT,
              })}
            >
              <DropdownItem
                href="/dashboard"
                className="flex items-center justify-between border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <Home className="mr-2 h-5 w-5" />
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">BACK HOME</span>
              </DropdownItem>

              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  setDropdownOpen(false); // close the dropdown
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
