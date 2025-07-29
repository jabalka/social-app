import { Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import IconWithTooltip from "../icon-with-tooltip";
import CancelEditButton from "./cancel-edit-button";
import KeepEditButton from "./keep-edit-button";

interface Props {
  value: string;
  originalValue: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
  isEditable?: boolean;
  theme: string;
  tooltipPlacement?: "top" | "right" | "bottom" | "left";
  editTooltip?: string;
  inputClassName?: string;
  displayClassName?: string;
  maxLength?: number;
  iconClassName?: string;
  inputType?: "text" | "number" | "email" | "password";
  multiline?: boolean;
  buttonSize?: "sm" | "md" | "lg";
  placeholder?: string;
  // Add these props to allow parent control of editing state
  isEditing?: boolean;
  setIsEditing?: (editing: boolean) => void;
}

const EditableInputField: React.FC<Props> = ({
  value,
  originalValue,
  onSave,
  onCancel,
  isEditable = true,
  theme,
  tooltipPlacement = "top",
  editTooltip = "Edit",
  inputClassName = "rounded border px-2 py-1 text-xl font-bold",
  displayClassName = "text-xl font-bold",
  iconClassName = "text-blue-500 h-4 w-4",
  inputType = "text",
  multiline = false,
  buttonSize = "md",
  maxLength,
  placeholder,
  // Use these props if provided, otherwise use internal state
  isEditing: externalIsEditing,
  setIsEditing: externalSetIsEditing,
}) => {
  // Use internal state if external control is not provided
  const [internalIsEditing, setInternalIsEditing] = useState(false);

  // Use either external or internal state management
  const isEditingState = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditingState = externalSetIsEditing || setInternalIsEditing;

  const [localValue, setLocalValue] = useState(value);

  // Update local value when parent value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleSave = () => {
    setIsEditingState(false);
    onSave(localValue);
  };

  const handleCancel = () => {
    setIsEditingState(false);
    setLocalValue(value);
    if (onCancel) onCancel();
  };

  // When in editing mode
  if (isEditingState) {
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
        {/* Compare with originalValue instead of value */}
        {localValue !== originalValue && <KeepEditButton onClick={handleSave} size={buttonSize} />}
      </>
    );
  }

  return (
    <>
      {multiline ? (
        <div className={displayClassName} style={{ whiteSpace: "pre-line" }}>
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
          onClick={() => setIsEditingState(true)}
        />
      )}
    </>
  );
};

export default EditableInputField;
