"use client";

import { cn } from "@/utils/cn.utils";
import Link from "next/link";
import React from "react";

interface Props {
  className?: string;
}

interface UsefulLink {
  label: string;
  href: string;
}

const links: UsefulLink[] = [
  { label: "LEGAL DISCLAIMER", href: "/documents/LegalDisclaimer-2024-02-16.pdf" },
  { label: "WHITEPAPER", href: "https://starck.gitbook.io/starck-whitepaper-v.3.0" },
  { label: "TERMS OF USE", href: "/documents/Terms-of-Use.pdf" },
  { label: "PRIVACY POLICY", href: "/documents/StarckPrivacyPolicy.pdf" },
  { label: "LEGAL AUDIT", href: "/documents/Legal-Audit-STK.pdf" },
  { label: "SOLID PROOF AUDIT", href: "/documents/SolidProof-Audit.pdf" },
];

const SidebarUsefulLinks: React.FC<Props> = ({ className }) => {
  return (
    <ul className={cn(className)}>
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} target="_blank" className="block px-3 text-sm text-zinc-500 hover:text-zinc-400">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SidebarUsefulLinks;
