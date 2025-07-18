
import React from "react";
import GlowingPinkButton from "./glowing-pink-button";
import GlowingGreenButton from "./glowing-green-button";

interface ProjectActionButtonsProps {
  onCancel: () => void;
  onSave: () => void;
}

const ActionButtonsCancelSave: React.FC<ProjectActionButtonsProps> = ({ onCancel, onSave }) => {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <GlowingPinkButton onClick={onCancel} className="text-sm">
        Cancel
      </GlowingPinkButton>
      <GlowingGreenButton onClick={onSave} className="text-sm">
        Save
      </GlowingGreenButton>
    </div>
  );
};

export default ActionButtonsCancelSave;