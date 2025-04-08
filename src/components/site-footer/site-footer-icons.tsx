import Link from "next/link";
import React from "react";
import GithubLogo from "../svg/github-logo";
import TelegramLogo from "../svg/telegram-logo";
import XTwitterLogo from "../svg/x-twitter-logo";
import YoutubeLogo from "../svg/youtube-logo";

const SiteFooterIcons: React.FC = () => {
  
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:flex-nowrap">
      <Link
        href="https://t.me/starckapp"
        className="rounded-full bg-white/10 p-2 transition-colors hover:bg-[#ff6913] focus-visible:bg-[#ff6913]"
      >
        <TelegramLogo className="sm:text-[1.5rem] text-[1rem] text-white" />
      </Link>

      <Link
        href="https://twitter.com/Starckcrypto"
        className="rounded-full bg-white/10 p-2 transition-colors hover:bg-[#ff6913] focus-visible:bg-[#ff6913]"
      >
        <XTwitterLogo className="sm:text-[1.5rem] text-[1rem] text-white" />
      </Link>

      <Link
        href="https://www.youtube.com/@Starckapp"
        className="rounded-full bg-white/10 p-2 transition-colors hover:bg-[#ff6913] focus-visible:bg-[#ff6913]"
      >
        <YoutubeLogo className="sm:text-[1.5rem] text-[1rem] text-white" />
      </Link>

      <Link
        href="https://github.com/jabalka/social-app"
        className="rounded-full bg-white/10 p-2 transition-colors hover:bg-[#ff6913] focus-visible:bg-[#ff6913]"
      >
        <GithubLogo className="sm:text-[1.5rem] text-[1rem] text-white" />
      </Link>
    </div>
  );
};

export default SiteFooterIcons;
