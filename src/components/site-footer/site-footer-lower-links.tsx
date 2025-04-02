import { cn } from "@/utils/cn.utils";
import Link from "next/link";
import React from "react";

interface Props {
  className?: string;
}

const SiteFooterLowerLinks: React.FC<Props> = ({ className }) => {
  return (
    <>
      <div className={cn("flex flex-col items-center gap-2 sm:flex-row sm:gap-4", className)}>
        <Link
          href="/documents/Legal-Audit-STK.pdf"
          className="uppercase text-white transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Legal audit
        </Link>

        <Link
          href="/documents/SolidProof-Audit.pdf"
          className="uppercase text-white transition-colors hover:text-[#ff6913] focus-visible:text-[#ff6913] focus-visible:outline-none"
        >
          Solid proof audit
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

export default SiteFooterLowerLinks;
