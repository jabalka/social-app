"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  theme: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  theme,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-col items-center justify-center text-sm text-gray-600 dark:text-gray-300">
      {/* Page count */}
      <span className="mb-2">
        {Math.min(currentPage * pageSize, totalCount)} / {totalCount}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-4">
      <div className="group relative flex flex-col items-center">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded px-3 py-1 font-semibold disabled:opacity-40"
        >
                       <ChevronLeft />
        </button>
                          {currentPage !== 1 && (
                            <div
                              className={cn(
                                "absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded px-2 py-1 text-xs transition-all group-hover:scale-100",
                                {
                                  "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                                  "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                                },
                              )}
                            >
                              Previous
                            </div>
                          )}
    </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            return (
              <div key={page} className="group relative flex flex-col items-center">
                <div className="group relative flex flex-col items-center overflow-hidden rounded-full p-[1px]">
                  {/* Glowing effect */}
                  {page !== currentPage && (
                    <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full group-hover:animate-snakeBorderGreen1s" />
                  )}

                  {/* Dot */}
                  <button
                    onClick={() => onPageChange(page)}
                    disabled={page === currentPage}
                    className={cn(
                      "relative z-10 h-[10px] w-[10px] rounded-full",
                      page === currentPage
                        ? "bg-green-600"
                        : "bg-gray-400 opacity-50 hover:opacity-100"
                    )}
                  />
                </div>

                {/* Tooltip */}
                <div
                  className={cn(
                    "absolute -top-9 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded px-2 py-1 text-xs transition-all group-hover:scale-100",
                    {
                      "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                      "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                    }
                  )}
                >
                  Page {page}
                </div>
              </div>
            );
          })}
        </div>
        <div className="group relative flex flex-col items-center">
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded px-3 py-1 font-semibold disabled:opacity-40"
        >
              <ChevronRight />
        </button>
                      {currentPage !== totalPages && (
                            <div
                              className={cn(
                                "absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded px-2 py-1 text-xs transition-all group-hover:scale-100",
                                {
                                  "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                                  "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                                },
                              )}
                            >
                              Next
                            </div>
                          )}
                          </div>
      </div>
    </div>
  );
};

export default Pagination;
