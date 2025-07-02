"use client";

import { cn } from "@/utils/cn.utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TooltipBubble from "./tooltip-bubble";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  theme: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, onPageChange, theme }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Always show pagination, but disable controls if no pages
  const isDisabled = totalPages <= 1;

  return (
    <div className="flex flex-col items-center justify-center text-sm text-gray-600 dark:text-gray-300">
      {/* Page count */}
      <span className="mb-[1px] text-xs">
        {totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount)} / {totalCount}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="group relative flex flex-col items-center">
          <button
            onClick={() => !isDisabled && onPageChange(Math.max(1, currentPage - 1))}
            disabled={isDisabled || currentPage === 1}
            className="rounded px-3 py-1 font-semibold disabled:opacity-40"
          >
            <ChevronLeft />
          </button>
          {!isDisabled && currentPage !== 1 && <TooltipBubble theme={theme} content="Previous" placement="top" />}
        </div>
        <div className="flex items-center gap-2">
          {isDisabled ? (
            <div className="h-[10px] w-[10px] rounded-full bg-gray-200 opacity-50" />
          ) : (
            Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              return (
                <div key={page} className="group relative flex flex-col items-center">
                  <div className="group relative flex flex-col items-center overflow-hidden rounded-full p-[1px]">
                    {/* Glowing effect */}
                    {page !== currentPage && (
                      <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full group-hover:animate-snakeBorderGreen1sLight" />
                    )}

                    {/* Dot */}
                    <button
                      onClick={() => onPageChange(page)}
                      disabled={page === currentPage}
                      className={cn(
                        "relative z-10 h-[10px] w-[10px] rounded-full",
                        page === currentPage ? "bg-green-600" : "bg-gray-400 opacity-50 hover:opacity-100",
                      )}
                    />
                  </div>

                  {/* Tooltip */}
                  <TooltipBubble theme={theme} content={`Page ${page}`} placement="top" />
                </div>
              );
            })
          )}
        </div>
        <div className="group relative flex flex-col items-center">
          <button
            onClick={() => !isDisabled && onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={isDisabled || currentPage === totalPages}
            className="rounded px-3 py-1 font-semibold disabled:opacity-40"
          >
            <ChevronRight />
          </button>
          {!isDisabled && currentPage !== totalPages && <TooltipBubble theme={theme} content="Next" placement="top" />}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
