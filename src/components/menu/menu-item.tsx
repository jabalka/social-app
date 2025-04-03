import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface MenuItem {
  label: string;
  href?: string;
  hasDropdown?: boolean;
  subItems?: Array<{
    label: string;
    href: string;
  }>;
}

interface MenuItemProps {
  item: MenuItem;
  toggleMenu: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, toggleMenu, isOpen, onToggle }) => {
  return (
    <div className="overflow-hidden border-b border-[#2b2725]">
      <button
        className={`group flex w-full items-center justify-between py-3 text-left ${item.hasDropdown ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (item.hasDropdown) {
            onToggle();
          } else if (item.href) {
            toggleMenu();
          }
        }}
      >
        <span
          className={`text-lg font-medium ${
            item.hasDropdown
              ? "text-white transition-colors group-hover:text-[#FF5C00]"
              : "text-white hover:text-[#FF5C00]"
          }`}
        >
          {item.label}
        </span>

        {item.hasDropdown && (
          <ChevronRight
            className={`h-5 w-5 transform transition-transform duration-300 ${
              isOpen ? "rotate-90 text-[#FF5C00]" : "text-white group-hover:text-[#FF5C00]"
            }`}
            strokeWidth={4}
          />
        )}
      </button>

      <div className={`transition-all duration-900 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"} overflow-hidden`}>
        <div className="mb-2 ml-4 space-y-2">
          {item.subItems?.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              className="block py-1 text-[#bda69c] transition-colors hover:text-[#FF5C00]"
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
