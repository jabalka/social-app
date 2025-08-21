import Image from "next/image";
import React from "react";
import DefaultImage from "../../public/images/project-image-dedfault.png";

const ReportIssueCardSkeleton: React.FC = () => {
  return (
    <div className="flex h-[300px] w-full min-w-[340px] flex-col justify-between rounded border p-4 shadow animate-pulse">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <div className="mb-1 h-5 w-1/2 rounded bg-gray-300" />
          <div className="mb-2 h-4 w-full rounded bg-gray-200" />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 flex gap-2">
            <div className="h-5 w-16 rounded bg-gray-300" />
            <div className="h-5 w-16 rounded bg-gray-300" />
            <div className="h-5 w-16 rounded bg-gray-300" />
          </div>
          <div className="group relative mt-3 inline-flex w-40 overflow-hidden rounded-full p-[1px]">
            <div className="h-10 w-full rounded-full bg-gray-300" />
          </div>
        </div>

        <div className="h-32 overflow-hidden rounded-2xl md:ml-6 md:h-auto md:w-1/3 flex-shrink-0 min-w-[120px] max-w-[240px]">
          <Image
            src={DefaultImage}
            alt="skeleton preview"
            width={240}
            height={240}
            className="h-full w-full object-cover opacity-60"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm opacity-60">
        <div className="h-4 w-10 rounded bg-gray-300" />
        <div className="h-4 w-10 rounded bg-gray-300" />
      </div>
    </div>
  );
};

export default ReportIssueCardSkeleton;