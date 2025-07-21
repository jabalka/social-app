import React from 'react';
import { X } from "lucide-react";

interface Props {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

const CancelEditButton: React.FC<Props> = ({
  onClick,
  size = 'md',
  ariaLabel = 'Cancel'
}) => {
  const buttonDimensions = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  }[size];

  return (
    <button onClick={onClick} aria-label={ariaLabel}>
      <X className={`flex ${buttonDimensions} items-center justify-center rounded-full p-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700`} />
    </button>
  );
};

export default CancelEditButton;