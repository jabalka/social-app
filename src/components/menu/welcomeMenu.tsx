import { ChevronDown } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const WelcomeMenu: React.FC = () => {
  return (
    <nav className="w-full min-w-max">
      <ul className="flex items-center justify-center whitespace-nowrap">
        <DropdownButton
          label="GET STARTED"
          items={[
            { href: "/what-is-starck", label: "CREATE PROJECT" },
            { href: "/faq", label: "SHARE IDEA" },
            { href: "/faq", label: "REPORT ISSUE" },
          ]}
        />

        <DropdownButton
          label="ABOUT"
          items={[
            { href: "/media", label: "What is CivDev" },
            { href: "/media", label: "FAQ" },
            { href: "/media", label: "CONTACT" },
          ]}
        />
      </ul>
    </nav>
  );
};

interface DropdownButtonProps {
  label: string;
  items: { href: string; label: string }[];
}

const DropdownButton: React.FC<DropdownButtonProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <li className="group relative p-1 sm:p-0.5 md:p-1" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-2 focus:outline-none"
      >
        <span
          className={`text-sm font-medium transition-transform duration-300 sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg ${
            isOpen || "group-hover:text-[#FF5C00]"
          } ${isOpen ? "text-[#FF5C00]" : "text-white"}`}
        >
          {label}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180 text-[#FF5C00]" : "text-white group-hover:text-[#FF5C00]"
          }`}
        />
      </button>

      <div
        className={`absolute z-[1] transition-all duration-200 ${isOpen || "pointer-events-none opacity-0"} ${
          isOpen ? "top-6 sm:top-5 md:top-5 lg:top-6 xl:top-7" : "top-5 sm:top-5 md:top-5 lg:top-6 xl:top-7"
        }`}
      >
        <div className="flex flex-col rounded-md bg-[#443d3a] shadow-lg">
          {items.map((item, index) => (
            <Link key={index} href={item.href} legacyBehavior passHref>
              <a className="nav-link border-l border-r border-gray-400/30 px-3 py-1.5 text-white transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00] sm:px-4 sm:py-2 lg:px-5 lg:py-2.5">
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </li>
  );
};

export default WelcomeMenu;
