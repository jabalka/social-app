import React, { useState, useEffect } from 'react';
import { Pencil } from "lucide-react";
import CancelEditButton from './cancel-edit-button';
import KeepEditButton from './keep-edit-button';
import IconWithTooltip from '../tooltip-with-icon';


interface Props {
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
  maxLength?: number;
  iconClassName?: string;
  inputType?: 'text' | 'number' | 'email' | 'password';
  multiline?: boolean;
  buttonSize?: 'sm' | 'md' | 'lg';
  placeholder?: string;
}

const EditableInputField: React.FC<Props> = ({
  value,

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
  multiline = false,
  buttonSize = 'md',
  maxLength,
  placeholder
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  
  // Important: Update local value when parent value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave(localValue);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalValue(value); 
    if (onCancel) onCancel();
  };

  // When in editing mode
  if (isEditing) {
    return (
      <>
        {multiline ? (
          <textarea
            value={localValue}
            onChange={handleChange}
            className={inputClassName}
            rows={5}
            autoFocus
            maxLength={maxLength}
            placeholder={placeholder}
          />
        ) : (
          <input
            type={inputType}
            value={localValue}
            onChange={handleChange}
            className={inputClassName}
            autoFocus
            maxLength={maxLength}
            placeholder={placeholder}
          />
        )}
        <CancelEditButton onClick={handleCancel} size={buttonSize} />
        {localValue !== value && (
          <KeepEditButton onClick={handleSave} size={buttonSize} />
        )}
      </>
    );
  }

  return (
    <>
      {multiline ? (
        <div className={displayClassName} style={{ whiteSpace: 'pre-line' }}>
          {value || <span className="text-gray-400">No content yet...</span>}
        </div>
      ) : (
        <span className={displayClassName}>{value}</span>
      )}
      {isEditable && (
        <IconWithTooltip
          id={`edit-field-${Math.random().toString(36).substring(7)}`}
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

export default EditableInputField;