// components/ModalOverlay.tsx
import React from "react";
// import { cn } from "@/utils/cn.utils";

interface ModalOverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-xl p-0">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 text-2xl text-gray-400 hover:text-gray-700"
          aria-label="Close"
        >
          ×
        </button>
        <div className="rounded-xl bg-white p-0 shadow-xl">{children}</div>
      </div>
    </div>
  );
};
export default ModalOverlay;
