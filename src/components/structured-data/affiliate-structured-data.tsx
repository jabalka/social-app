import { fullPath } from "@/utils/url.utils";
import React from "react";
import { ProgramMembership, WebPage } from "schema-dts";
import StructuredData from ".";

const affiliateProgram: ProgramMembership = {
  "@type": "ProgramMembership",
  name: "STARCK Affiliate Program",
  description: "A program that allows affiliates to earn rewards by promoting STARCK's AI-driven stock market tools.",
  membershipPointsEarned: {
    "@type": "QuantitativeValue",
    name: "STK Tokens",
    value: "Variable",
    unitText: "tokens",
  },
};

const webPageData: WebPage = {
  "@type": "WebPage",
  url: fullPath("/affiliate"),
  name: "STARCK Affiliate Program",
  description:
    "Join the STARCK Affiliate Program to earn rewards by promoting our AI-driven stock market analysis tools.",
  mainEntity: affiliateProgram,
};

const AffiliateStructuredData: React.FC = () => {
  return <StructuredData id="affiliate-structured-data" data={webPageData} />;
};

export default AffiliateStructuredData;
