import React from "react";

interface LeaveDraftModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
}

const LeaveDraftModal: React.FC<LeaveDraftModalProps> = ({ open, onConfirm, onCancel, title, description }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex w-full max-w-sm flex-col items-center rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-2 text-lg font-semibold">{title}</div>
        <div className="mb-6 text-sm text-gray-700">{description}</div>
        <div className="flex w-full justify-end gap-4">
          <button onClick={onCancel} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
            Stay
          </button>
          <button onClick={onConfirm} className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveDraftModal;
