import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface MenuItem {
  label: string;
  href?: string;
  hasDropdown?: boolean;
  subItems?: Array<{
    label: string;
    href: string;
  }>;
  icon?: React.ReactNode;
}

interface MenuItemProps {
  item: MenuItem;
  toggleMenu: () => void;
  isOpen: boolean;
  onToggle: () => void;
  theme: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, toggleMenu, isOpen, onToggle, theme }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggle(); // close submenu
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div ref={menuRef} className={cn("overflow-hidden border-b border-[#2b2725]", {
              "text-zinc-700": theme === Theme.LIGHT,
              "text-zinc-200": theme === Theme.DARK,
    })}>
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex w-full items-center justify-between py-3 text-left ${
        item.hasDropdown ? "cursor-pointer" : ""
      }`}
      onClick={(e) => {
        if (item.hasDropdown) {
          onToggle();
          if (isOpen) {
            setIsHovered(false); 
          }
          (e.currentTarget as HTMLButtonElement).blur();
        } else if (item.href) {
          toggleMenu();
        }
      }}
    >
      <div className="flex w-full items-center justify-between">
        {/* label + optional icon block */}
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-medium transition-colors ${
              isOpen || isHovered ? "text-[#FF5C00]" : ""
            }`}
          >
            {item.label}
          </span>
          {!item.hasDropdown && item.icon && (
            <div className="transition-colors group-hover:text-[#FF5C00]">
              {item.icon}
            </div>
          )}
        </div>
  
        {/* Chevron separated, stable */}
        {item.hasDropdown && (
          <ChevronRight
            className={`h-5 w-5 transform transition-transform duration-300 ${
              isOpen ? "rotate-90 text-[#FF5C00]" : isHovered ? "text-[#FF5C00]" : ""
            }`}
            strokeWidth={4}
          />
        )}
      </div>
    </button>
  
    {/* Submenu */}
    <div
      className={`overflow-hidden transition-all duration-700 ease-in-out ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="mb-2 ml-4 space-y-2">
        {item.subItems?.map((subItem, index) => (
          <Link
            key={index}
            href={subItem.href}
            className={cn("block py-1 transition-colors hover:text-[#FF5C00]", {
                      "text-zinc-700": theme === Theme.LIGHT,
                      "text-zinc-200": theme === Theme.DARK,
            })}
            onClick={toggleMenu}
          >
            {subItem.label}
          </Link>
        ))}
      </div>
    </div>
  </div>
  );
};

export default MenuItem;
