import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface MenuItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  subItems?: Array<{
    label: string;
    href: string;
  }>;
}

interface MenuItemProps {
  item: MenuItem;
  toggleMenu: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, toggleMenu }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-800 py-3">
      <div className="flex items-center justify-between">
        <Link
          href={item.href}
          className="text-lg font-medium text-white transition-colors hover:text-[#FF5C00]"
          onClick={!item.hasDropdown ? toggleMenu : undefined}
        >
          {item.label}
        </Link>
        {item.hasDropdown && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#FF5C00] transition-colors hover:text-[#FF7A33]"
          >
            <ChevronRight
              className={`h-5 w-5 transform transition-transform ${isOpen ? "rotate-90" : ""}`}
              strokeWidth={4}
            />
          </button>
        )}
      </div>
      {isOpen && item.subItems && (
        <div className="ml-4 mt-2 space-y-2">
          {item.subItems.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              className="block text-gray-400 transition-colors hover:text-[#FF5C00]"
              onClick={toggleMenu}
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItem;
