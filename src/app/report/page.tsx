"use client";

import ReportIssueCreateForm from "@/components/report-issue-create-form";
import React from "react";

const ReportPage: React.FC = () => {

  return (
    <>
              <div className="mx-auto max-w-7xl px-6 py-16">
            <h1 className="mb-6 text-3xl font-bold">Report an Issue in Your Area</h1>
            <ReportIssueCreateForm  />
          </div>

    </>
  );
};

export default ReportPage;

