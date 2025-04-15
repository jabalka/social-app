import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Link from "next/link";
import React from "react";

interface Props {
  className?: string;
  theme: string
}

const SiteFooterUpperLinksWelcome: React.FC<Props> = ({ className, theme }) => {
  return (
    <>

      <div className={cn("flex flex-col items-center gap-2 sm:flex-row sm:gap-8", className, {
          "text-zinc-700":
          theme === Theme.LIGHT,
        "text-zinc-200":
          theme === Theme.DARK,
      })}>
        <Link
          href="https://www.citizensadvice.org.uk/about-us/contact-us/"
          className="uppercase transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Legal Advice
        </Link>

        <Link
          href="/documents/Terms-of-Use.pdf"
          className="uppercase transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Terms of use
        </Link>

        <Link
          href="/documents/StarckPrivacyPolicy.pdf"
          className="uppercase transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Privacy policy
        </Link>

        <Link
          href="/contact"
          className="uppercase transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Contact us
        </Link>
      </div>
    </>
  );
};

export default SiteFooterUpperLinksWelcome;
