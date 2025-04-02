import { cn } from "@/utils/cn.utils";
import Link from "next/link";
import React from "react";

interface Props {
  className?: string;
}

const SiteFooterUpperLinks: React.FC<Props> = ({ className }) => {
  return (
    <>
      <div className={cn("flex flex-col items-center gap-2 sm:flex-row sm:gap-8", className)}>
        <Link
          href="/documents/LegalDisclaimer-2024-02-16.pdf"
          className="uppercase text-white transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Legal disclaimer
        </Link>

        <Link
          href="https://starck.gitbook.io/starck-whitepaper-v.3.0"
          className="uppercase text-white transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Whitepaper
        </Link>

        <Link
          href="/documents/Terms-of-Use.pdf"
          className="uppercase text-white transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Terms of use
        </Link>

        <Link
          href="/documents/StarckPrivacyPolicy.pdf"
          className="uppercase text-white transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Privacy policy
        </Link>
      </div>
    </>
  );
};

export default SiteFooterUpperLinks;
