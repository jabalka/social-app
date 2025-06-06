import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { motion, useInView } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQSectionProps {
  title: string;
  faqs: FAQItem[];
  section: string;
  theme?: string;
}

const FAQSection: React.FC<FAQSectionProps> = ({ title, faqs, section }) => {
  const { theme } = useSafeThemeContext();
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-10% 0px -10% 0px", amount: "some" });
  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  return (
    <motion.div
      // whileHover={{ scale: 1.04 }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6 }}
      className={cn("py-10", {})}
    >
      <div ref={ref} className="px-6 mt-10">
        <h2 className="mb-10 text-center text-4xl font-bold">{title}</h2>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="group relative w-full mx-auto max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-4xl m-2 rounded-3xl overflow-hidden p-[0px] duration-300 hover:scale-[1.04]">
              <div
                className={cn(
                  "group/expandable rounded-3xl bg-gradient-to-b from-[#d9b8a71a] via-[#514e4d45] to-[#00000063] p-5 shadow-lg",
                  {
                    "border-[2px] border-zinc-400": theme === Theme.LIGHT,
                    "border-[2px] border-zinc-700": theme === Theme.DARK,
                  },
                )}
              >
                <div
                  className="flex cursor-pointer items-center justify-between"
                  data-section={section}
                  data-index={index}
                >
                  <h3 className="text-lg font-semibold transition-colors duration-300">{faq.question}</h3>

                  <button
                    className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-600 transition-all duration-300 group-hover/expandable:border-white"
                    aria-label="Toggle FAQ"
                  >
                    <span className="absolute h-[2px] w-3 shrink-0 bg-gray-600 transition-all duration-300 group-hover/expandable:bg-white"></span>
                    <span className="absolute h-3 w-[2px] shrink-0 bg-gray-600 transition-all duration-300 group-hover/expandable:bg-white"></span>
                  </button>
                </div>

                <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-500">
                  <p className="whitespace-pre-line text-sm leading-relaxed"> {faq.answer}</p>
                </div>

                <span
                  key={animationKey}
                  className="pointer-events-none absolute -inset-[0px] rounded-3xl group-hover:animate-snakeBorderHover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FAQSection;
