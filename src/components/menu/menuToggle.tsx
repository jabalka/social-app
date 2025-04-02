import React from "react";

interface MenuToggleProps {
  active: boolean;
  onClick: () => void;
}

const MenuToggle: React.FC<MenuToggleProps> = ({ active, onClick }) => {
  return (
    <button
      className="z-40 flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#FF5C00] transition-colors hover:bg-[#FF7A33] focus:outline-none"
      data-active={active}
      aria-label="Toggle menu"
      onClick={onClick}
    >
      <div className="flex h-5 w-6 flex-col justify-between">
        <span
          className={`h-0.5 w-full transform rounded-full bg-white transition-transform ${!active ? "translate-y-2 rotate-45" : ""}`}
        />
        <span className={`h-0.5 w-full rounded-full bg-white transition-opacity ${!active ? "opacity-0" : ""}`} />
        <span
          className={`h-0.5 w-full transform rounded-full bg-white transition-transform ${!active ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </div>
    </button>
  );
};

export default MenuToggle;
