import React, { useState } from 'react';
import { Check, Pencil, X } from "lucide-react";
import IconWithTooltip from './tooltip-with-icon';

interface EditableFieldProps {
  value: string;
  originalValue: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
  isEditable?: boolean;
  theme: string;
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
  editTooltip?: string;
  inputClassName?: string;
  displayClassName?: string;
  iconClassName?: string;
  inputType?: 'text' | 'number' | 'email' | 'password';
  buttonSize?: 'sm' | 'md' | 'lg';
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  originalValue,
  onSave,
  onCancel,
  isEditable = true,
  theme,
  tooltipPlacement = 'top',
  editTooltip = 'Edit',
  inputClassName = "rounded border px-2 py-1 text-xl font-bold",
  displayClassName = "text-xl font-bold",
  iconClassName = "text-blue-500 h-4 w-4",
  inputType = 'text',
  buttonSize = 'md',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  
  const buttonDimensions = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }[buttonSize];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave(localValue);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalValue(originalValue);
    if (onCancel) onCancel();
  };

   if (isEditing) {
    return (
      <>
        <input
          type={inputType}
          value={localValue}
          onChange={handleChange}
          className={inputClassName}
          autoFocus
        />
        <button onClick={handleCancel} aria-label="Cancel">
          <X className={`flex ${buttonDimensions} items-center justify-center rounded-full p-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700`} />
        </button>
        {localValue !== originalValue && (
          <button onClick={handleSave} aria-label="Save">
            <Check className={`flex ${buttonDimensions} items-center justify-center rounded-full p-1 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700`} />
          </button>
        )}
      </>
    );
  }

  return (
    <>
      <span className={displayClassName}>{value}</span>
      {isEditable && (
        <IconWithTooltip
          id={`edit-field-${Math.random().toString(36).substr(2, 9)}`}
          icon={Pencil}
          content={editTooltip}
          theme={theme}
          tooltipPlacement={tooltipPlacement}
          iconClassName={iconClassName}
          onClick={() => setIsEditing(true)}
        />
      )}
    </>
  );
};

export default EditableField;