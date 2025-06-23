import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { motion, useInView } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import FAQItem from "./faq-item";

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
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={false} // You can manage open state if needed
              onClick={() => {}} // Handle click to toggle open state
              theme={theme || Theme.LIGHT}
              animationKey={animationKey}
              section={section}
              index={index}
 /> ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FAQSection;
