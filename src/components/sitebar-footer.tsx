import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  theme: string;
}

const Footer: React.FC<Props> = ({ theme }) => {
  return (
    <footer
      className={cn("space-y-4 border-t py-6 text-center text-sm", {
        "border-zinc-300 bg-gradient-to-br from-zinc-100 via-indigo-50 via-40% to-slate-200 text-zinc-700":
          theme === Theme.LIGHT,
        "border-zinc-700 bg-gradient-to-br from-zinc-900 via-indigo-950 via-60% to-slate-900 text-zinc-300":
          theme === Theme.DARK,
      })}
    >
      <p>
        © Copyright 2024
        <Link
          href="{process.env.NEXT_PUBLIC_APP_URL}"
          target="_blank"
          className="cursor-pointer text-[#ff6913] hover:text-[#c75413] active:text-[#914011]"
        >
          {" "}
          STARCK
        </Link>
      </p>

      <p>BE PART OF THE STARCK COMMUNITY</p>

      <div className="flex justify-center gap-4">
        <Link href="https://t.me/starckapp" target="_blank" rel="noopener noreferrer">
          <Image src="/images/iconTelegram.png" alt="Telegram Logo" width={42} height={42} />
        </Link>

        <Link href="https://twitter.com/Starckcrypto" target="_blank" rel="noopener noreferrer">
          <Image src="/images/iconTwitter_X.png" alt="X Logo" width={42} height={42} />
        </Link>

        <Link href="https://medium.com/@starckcrypto" target="_blank" rel="noopener noreferrer">
          <Image src="/images/iconMediumLogo.png" alt="Medium Logo" width={42} height={42} />
        </Link>

        <Link href="https://reddit.com/user/Starck-crypto/" target="_blank" rel="noopener noreferrer">
          <Image src="/images/iconReddit.png" alt="Reddit Logo" width={42} height={42} />
        </Link>

        <Link href="https://discord.gg/GNna7x6fvH" target="_blank" rel="noopener noreferrer">
          <Image src="/images/discord.svg" alt="Discord Logo" width={42} height={42} />
        </Link>

        <Link href="https://youtube.com/@Starckapp" target="_blank" rel="noopener noreferrer">
          <Image src="/images/iconYTube.svg" alt="YouTube Logo" width={42} height={42} />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
