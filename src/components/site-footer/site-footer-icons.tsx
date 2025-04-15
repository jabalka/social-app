import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Link from "next/link";
import React from "react";
import GithubLogo from "../svg/github-logo";
import TelegramLogo from "../svg/telegram-logo";
import XTwitterLogo from "../svg/x-twitter-logo";
import YoutubeLogo from "../svg/youtube-logo";

interface Props {
  theme: string;
}

const SiteFooterIcons: React.FC<Props> = ({ theme }) => {
  return (
    <div
      className={cn("flex flex-wrap justify-center gap-2 sm:flex-nowrap", {
        "text-[#f0e6e2]": theme === Theme.DARK,
        "text-[#2b2725]": theme === Theme.LIGHT,
      })}
    >
      <Link
        href="https://t.me/civildev"
        className="rounded-full bg-black/10 p-2 transition-colors hover:bg-[#ff6913] focus-visible:bg-[#ff6913]"
      >
        <TelegramLogo className="text-[1rem] sm:text-[1.5rem]" />
      </Link>

      <Link
        href="https://twitter.com/civildev"
        className="rounded-full bg-black/10 p-2 transition-colors hover:bg-[#ff6913] focus-visible:bg-[#ff6913]"
      >
        <XTwitterLogo className="text-[1rem] sm:text-[1.5rem]" />
      </Link>

      <Link
        href="https://www.youtube.com/civildev"
        className="rounded-full bg-black/10 p-2 transition-colors hover:bg-[#ff6913] focus-visible:bg-[#ff6913]"
      >
        <YoutubeLogo className="text-[1rem] sm:text-[1.5rem]" />
      </Link>

      <Link
        href="https://github.com/jabalka/social-app"
        className="rounded-full bg-black/10 p-2 transition-colors hover:bg-[#ff6913] focus-visible:bg-[#ff6913]"
      >
        <GithubLogo className="text-[1rem] sm:text-[1.5rem]" />
      </Link>
    </div>
  );
};

export default SiteFooterIcons;
