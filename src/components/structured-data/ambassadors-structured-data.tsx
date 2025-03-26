import { fullPath } from "@/utils/url.utils";
import React from "react";
import { EducationalOccupationalProgram, WebPage } from "schema-dts";
import StructuredData from ".";

const ambassadorProgram: EducationalOccupationalProgram = {
  "@type": "EducationalOccupationalProgram",
  name: "Starck Ambassador Program",
  description:
    "Join the STARCK Ambassador Program to promote and support the Starck Token (STK) and its innovative technologies in the AI Starck Information Platform (ASIP).",
  educationalProgramMode: "Online",
  occupationalCategory: "Marketing, Blockchain Technology, Community Management",
  provider: {
    "@type": "Organization",
    name: "Starck",
    url: fullPath("/"),
  },
};

const webPageData: WebPage = {
  "@type": "WebPage",
  url: fullPath("/ambassadors"),
  name: "Become an Ambassador | Starck Platform",
  description: "Apply to become a Starck Ambassador and help us grow our community",
  mainEntity: ambassadorProgram,
};

const AmbassadorsStructuredData: React.FC = () => {
  return <StructuredData id="ambassadors-structured-data" data={webPageData} />;
};

export default AmbassadorsStructuredData;
