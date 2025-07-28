import React, { ReactNode } from "react";
import GlowingPinkButton from "./glowing-pink-button";
import GlowingGreenButton from "./glowing-green-button";
import RequiredStar from "../required-star";

type ButtonPosition = "start" | "center" | "end";

interface ActionButtonsProps {
  cancelText?: string;
  submitText?: string;
  
  onCancel: () => void;
  onSubmit?: () => void;
  
  loading?: boolean;
  disabled?: boolean;
  
  type?: "button" | "submit" | "reset";
  form?: string;
  
  showRequiredIndicator?: boolean;
  additionalElement?: ReactNode;
  
  className?: string;
  theme?: string;
  position?: ButtonPosition; 
  
  showCloseButton?: boolean;
  onClose?: () => void;
  closeButtonClassName?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  // Default values for props
  cancelText = "Back",
  submitText = "Submit",
  onCancel,
  onSubmit,
  loading = false,
  disabled = false,
  type = "submit",
  form,
  showRequiredIndicator = false,
  additionalElement,
  className = "",
  theme,
  position = "start",
  showCloseButton = false,
  onClose,
  closeButtonClassName = "rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400",
}) => {
  const positionClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  }[position];

  return (
    <div className={`flex gap-2 ${positionClass} ${className}`}>
      <GlowingPinkButton onClick={onCancel}>
        {cancelText}
      </GlowingPinkButton>
      
      <div className="relative">
        {/* Required fields indicator - positioned above the green button */}
        {showRequiredIndicator && (
          <div 
            className={`absolute bottom-full left-0 right-0 mb-1 text-xs text-center transition-opacity duration-300 ${
              disabled ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="flex items-center justify-center">
              <RequiredStar />
              <span className="ml-1">Required fields</span>
            </span>
          </div>
        )}
        
        <GlowingGreenButton 
          theme={theme}
          type={type}
          form={form} 
          onClick={onSubmit}
          disabled={disabled || loading}
          className="px-4 py-2"
        >
          {loading ? "Submitting..." : submitText}
        </GlowingGreenButton>
      </div>
      
      {additionalElement && additionalElement}
      
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className={closeButtonClassName}
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default ActionButtons;