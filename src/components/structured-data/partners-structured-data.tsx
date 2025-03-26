import { fullPath } from "@/utils/url.utils";
import React from "react";
import { ProgramMembership, WebPage } from "schema-dts";
import StructuredData from ".";

const partnerProgram: ProgramMembership = {
  "@type": "ProgramMembership",
  name: "STARCK Partner Program",
  description:
    "A program designed for companies and organizations to create strategic alliances and expand their influence through Starck's innovative AI-driven platform.",
};

const webPageData: WebPage = {
  "@type": "WebPage",
  url: fullPath("/partners"),
  name: "STARCK Partner Program",
  description:
    "Join the STARCK Partner Program to create strategic alliances and unlock growth opportunities through our AI-driven platform.",
  mainEntity: partnerProgram,
};

const PartnersStructuredData: React.FC = () => {
  return <StructuredData id="partners-structured-data" data={webPageData} />;
};

export default PartnersStructuredData;
