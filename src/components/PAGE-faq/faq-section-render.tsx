"use client";

import type React from "react";
import { useEffect, useState } from "react";
import FAQSections from "./faq-sections";

const FAQSectionComponent: React.FC = () => {
  const [openIndexes, setOpenIndexes] = useState<{ [key: string]: number | null }>({
    aboutStarck: null,
    aboutPlatform: null,
    aboutPrograms: null,
    aboutSecurity: null,
    aboutRegistration: null,
    aboutOthers: null,
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const faqItem = target.closest("[data-section][data-index]");
      if (faqItem) {
        const section = faqItem.getAttribute("data-section");
        const index = Number.parseInt(faqItem.getAttribute("data-index") || "0", 10);
        if (section) {
          setOpenIndexes((prevIndexes) => ({
            ...prevIndexes,
            [section]: prevIndexes[section] === index ? null : index,
          }));
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const updateFAQStyles = () => {
      Object.entries(openIndexes).forEach(([section, openIndex]) => {
        const items = document.querySelectorAll(`[data-section="${section}"]`);
        items.forEach((item, index) => {
          const title = item.querySelector("h3");
          const button = item.querySelector("button");
          const content = item.querySelector(".faq-answer") as HTMLElement;


          setTimeout(() => {
            content?.querySelectorAll("a")?.forEach((link) => {
              link.classList.add("text-blue-500", "transition-colors", "duration-300", "hover:text-[#FF5C00]");
            });
          }, 100); // Delay to ensure DOM updates
          if (index === openIndex) {
            title?.classList.add("!text-[#FF5C00]");
            button?.classList.add("!rotate-90", "!border-[#FF5C00]");
            button?.querySelector("span:first-child")?.classList.add("!bg-[#FF5C00]", "!opacity-0");
            button?.querySelector("span:last-child")?.classList.add("!rotate-10", "!bg-[#FF5C00]");
            content.style.maxHeight = `${content.scrollHeight}px`;
            content.style.opacity = "1";
          } else {
            title?.classList.remove("!text-[#FF5C00]");
            button?.classList.remove("!rotate-90", "!border-[#FF5C00]");
            button?.querySelector("span:first-child")?.classList.remove("!bg-[#FF5C00]", "!opacity-0");
            button?.querySelector("span:last-child")?.classList.remove("!rotate-10", "!bg-[#FF5C00]");
            content.style.maxHeight = "0";
            content.style.opacity = "0";
          }
        });
      });
    };

    updateFAQStyles();
  }, [openIndexes]);

  return <FAQSections />;
};

export default FAQSectionComponent;
