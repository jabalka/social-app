"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { User } from "@prisma/client";
import { CircleUserRound } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface Props {
  theme: string;
  user: User;
  className?: string;
}

const ProfileDetails: React.FC<Props> = ({ theme, user, className }) => {
  const handleSignOut = () => {
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
      <span className="hidden md:block">{user.email}</span>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn("rounded-full ring-[#ff6913] focus-visible:outline-none focus-visible:ring-2")}
        >
          {user.image ? (
            <Image src={user.image} alt="User Avatar" width={40} height={40} className="rounded-full" />
          ) : (
            <>
              <CircleUserRound className="h-9 w-9" />
            </>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent className="mr-4">
          <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileDetails;
