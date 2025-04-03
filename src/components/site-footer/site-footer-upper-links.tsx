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
          href="https://www.citizensadvice.org.uk/about-us/contact-us/"
          className="uppercase text-white transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Legal Advice
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

        <Link
          href="/contact"
          className="uppercase text-white transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Contact us
        </Link>
      </div>
    </>
  );
};

export default SiteFooterUpperLinks;
