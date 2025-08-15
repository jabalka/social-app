"use client";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React, { useEffect } from "react";

interface ModalOverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  theme: string;
  modalWidthClasses?: string;
  modalHeightClasses?: string;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({
  open,
  onClose,
  children,
  className,
  showCloseButton = true,
  theme,
  modalWidthClasses = "w-full sm:max-w-xl md:max-w-3xl",
  modalHeightClasses = "max-h-[90vh]",
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
     
        <div
          className={cn(
            "relative mx-auto w-full rounded-xl overflow-hidden bg-white shadow-xl",
            modalWidthClasses,
            className,
          )}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-2 top-2 z-10 text-2xl text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              ×
            </button>
          )}
          {!showCloseButton && (
            <button
              onClick={onClose}
              className={cn("absolute right-2 top-2 z-10 rounded-full p-2 transition-colors", {
                "bg-gray-200 text-gray-800 hover:bg-gray-300": theme === Theme.LIGHT,
                "bg-gray-700 text-gray-200 hover:bg-gray-600": theme === Theme.DARK,
              })}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <div
            className={cn("relative w-full overflow-y-auto",
              modalHeightClasses,
               {
              "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
              "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
            },

          )}
          >
              <div className="flex h-full w-full flex-col">
            {children}
          </div>
          </div>
        </div>

    </div>
  );
};

export default ModalOverlay;
