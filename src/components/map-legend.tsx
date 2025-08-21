"use client";

import Image from "next/image";

type LegendSize = "small" | "normal" | "large";

interface Props {
  size?: LegendSize;
}

const sizeConfig: Record<
  LegendSize,
  {
    containerPadding: string;
    titleClass: string;
    itemTextClass: string;
    itemGapClass: string;
    iconPx: number;
  }
> = {
  small: {
    containerPadding: "p-2",
    titleClass: "text-xs",
    itemTextClass: "text-xs",
    itemGapClass: "gap-1.5",
    iconPx: 14,
  },
  normal: {
    containerPadding: "p-3",
    titleClass: "text-sm",
    itemTextClass: "text-sm",
    itemGapClass: "gap-2",
    iconPx: 20,
  },
  large: {
    containerPadding: "p-4",
    titleClass: "text-base",
    itemTextClass: "text-base",
    itemGapClass: "gap-3",
    iconPx: 28,
  },
};

const ProjectMapLegend: React.FC<Props> = ({ size = "normal" }) => {
  const sz = sizeConfig[size];

  const legendItems = [
    { label: "Proposed", src: "/images/project-proposed.png" },
    { label: "In Progress", src: "/images/project-in-progress.png" },
    { label: "Completed", src: "/images/project-completed.png" },
    { label: "Rejected", src: "/images/marker-icon.png" },
  ];

  return (
    <div
      className={[
        "pointer-events-auto absolute bottom-2 left-2 z-[1000] select-none",
        "rounded-md border border-black/5 bg-white/90 shadow-lg backdrop-blur-sm",
        "dark:border-white/10 dark:bg-zinc-900/80",
        "max-w-[min(80vw,280px)]",
        sz.containerPadding,
      ].join(" ")}
      role="region"
      aria-label="Project map legend"
    >
      <h4 className={["mb-2 font-semibold text-gray-800 dark:text-zinc-100", sz.titleClass].join(" ")}>Legend</h4>

      <ul className="m-0 list-none space-y-2 p-0">
        {legendItems.map((item) => (
          <li
            key={item.label}
            className={[
              "flex items-center",
              sz.itemGapClass,
              sz.itemTextClass,
              "text-gray-700 dark:text-zinc-200",
            ].join(" ")}
          >
            <Image src={item.src} alt={item.label} width={sz.iconPx} height={sz.iconPx} className="flex-shrink-0" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectMapLegend;
