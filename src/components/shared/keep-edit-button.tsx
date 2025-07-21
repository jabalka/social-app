import React from 'react';
import { Check } from "lucide-react";

interface Props {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

const KeepEditButton: React.FC<Props> = ({
  onClick,
  size = 'md',
  ariaLabel = 'Save'
}) => {
  const buttonDimensions = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }[size];

  return (
    <button onClick={onClick} aria-label={ariaLabel}>
      <Check className={`flex ${buttonDimensions} items-center justify-center rounded-full p-1 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700`} />
    </button>
  );
};

export default KeepEditButton;