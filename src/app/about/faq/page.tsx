import FAQSectionComponent from "@/components/PAGE-faq/faq-section-render";
import { generateMetadata } from "@/utils/metadata.utils";
import React from "react";

export const metadata = generateMetadata({
  title: "FAQ",
});

const FAQPage: React.FC = () => {
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <FAQSectionComponent />
      </div>
    </>
  );
};

export default FAQPage;
