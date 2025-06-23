import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React from "react";

interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  theme: string;
  animationKey: number;
  section: string;
  index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,

  theme,
  animationKey,
  section,
  index,
}) => (
    <div key={index} className="group relative w-full mx-auto max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-4xl m-2 rounded-3xl overflow-hidden p-[0px] duration-300 hover:scale-[1.04]">
    <div
      className={cn(
        "group/expandable rounded-3xl bg-gradient-to-b from-[#d9b8a71a] via-[#514e4d45] to-[#00000063] p-5 shadow-lg cursor-pointer",
        {
          "border-[2px] border-zinc-400": theme === Theme.LIGHT,
          "border-[2px] border-zinc-700": theme === Theme.DARK,
        },
      )}
      data-section={section}
      data-index={index}
    >
      <div
        className="flex cursor-pointer items-center justify-between"

      >
        <h3 className="text-lg font-semibold transition-colors duration-300">{question}</h3>

        <button
          className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-600 transition-all duration-300 group-hover/expandable:border-white"
          aria-label="Toggle FAQ"
        >
          <span className="absolute h-[2px] w-3 shrink-0 bg-gray-600 transition-all duration-300 group-hover/expandable:bg-white"></span>
          <span className="absolute h-3 w-[2px] shrink-0 bg-gray-600 transition-all duration-300 group-hover/expandable:bg-white"></span>
        </button>
      </div>

      <div className="faq-answer mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-500">
        <p className="whitespace-pre-line text-sm leading-relaxed"> {answer}</p>
      </div>

      <span
        key={animationKey}
        className={cn("pointer-events-none absolute -inset-[0px] rounded-3xl",{
          "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
          "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
        })}
      />
    </div>
  </div>
);

export default FAQItem;
