import React from "react";

interface MobileMenuToggleProps {
  active: boolean;
  onClick: () => void;
  className?: string;
  size?: number;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ active, onClick, className, size }) => {
    const barContainerHeight = (20 / 48) * size!;
    const barContainerWidth = (24 / 48) * size!;
    const barThickness = (2 / 48) * size!;
    const translateY = (8 / 48) * size!; // original "translate-y-2" = 0.5rem = 8px
  return (<>
    <div className={className}>
      <button
        className="z-40 flex flex-col items-center justify-center rounded-full transition-colors hover:bg-[#bda69c] focus:outline-none"
        style={{ width: size, height: size, backgroundColor: "#8f7f79" }}
        data-active={active}
        aria-label="Toggle menu"
        onClick={onClick}
      >
        <div
          className="flex flex-col justify-between"
          style={{
            height: barContainerHeight,
            width: barContainerWidth,
          }}
        >
          <span
            className="w-full rounded-full bg-white transition-transform"
            style={{
              height: barThickness,
              transform: !active ? `translateY(${translateY}px) rotate(45deg)` : undefined,
            }}
          />
          <span
            className="w-full rounded-full bg-white transition-opacity"
            style={{
              height: barThickness,
              opacity: !active ? 0 : 1,
            }}
          />
          <span
            className="w-full rounded-full bg-white transition-transform"
            style={{
              height: barThickness,
              transform: !active ? `translateY(-${translateY}px) rotate(-45deg)` : undefined,
            }}
          />
        </div>
      </button>
    </div>
  
  
  </>
  );
};

export default MobileMenuToggle;
