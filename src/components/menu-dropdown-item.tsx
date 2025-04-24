"use client";

import Link from "next/link";
import React from "react";

interface Props {
    href: string;
    children: React.ReactNode;
    className?: string;
}

const DropdownItem: React.FC<Props> = ({ href, children, className = "" }) => {
  return (
    <Link
      href={href}
      onClick={(e) => e.currentTarget.blur()}
      className={`nav-link border-l border-r border-gray-400/30 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00] sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 ${className}`}
    >
      {children}
    </Link>
  );
};

export default DropdownItem;




  