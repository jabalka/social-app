import { cn } from "@/utils/cn.utils";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

import React from "react";
import IconWithTooltip from "../icon-with-tooltip";

interface EditableTextFieldProps {
  mode: 'create' | 'view' | 'edit';
  label: string;
  value: string;
  theme: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  onChange?: (value: string) => void;
  allowEdit?: boolean;
  required?: boolean;
  charCounter?: boolean;
}

const EditableTextField: React.FC<EditableTextFieldProps> = ({
  mode,
  label,
  value,
  theme,
  placeholder = "",
  multiline = false,
  maxLength,
  onChange,
  allowEdit = false,
//   required = false,
  charCounter = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const isLimitReached = maxLength && localValue.length >= maxLength;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    if (mode === 'create' && onChange) {
      onChange(e.target.value);
    }
  };
  
  const handleSave = () => {
    setIsEditing(false);
    if (onChange) {
      onChange(localValue);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setLocalValue(value);
  };
  
  // create mode - always show editable field
  if (mode === 'create') {
    return (
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-semibold">{label}</label>
        </div>
        {multiline ? (
          <textarea
            value={localValue}
            onChange={handleChange}
            className={cn("w-full resize-none rounded border p-2", {
              "border-red-400": isLimitReached
            })}
            placeholder={placeholder}
            rows={4}
            maxLength={maxLength}
          />
        ) : (
          <input
            type="text"
            value={localValue}
            onChange={handleChange}
            className="w-full rounded border p-2"
            placeholder={placeholder}
          />
        )}
        {charCounter && maxLength && (
          <div className="mt-1 flex justify-end text-xs">
            <span className={isLimitReached ? "font-semibold text-red-500" : "text-gray-500"}>
              {localValue.length}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <div className="flex items-start justify-between">
        <label className="mb-1 text-sm font-medium">{label}:</label>
        {isEditing ? (
          <div className="flex gap-1">
            <button onClick={handleCancel} aria-label="Cancel">
              <X className="flex h-8 w-8 items-center justify-center rounded-full p-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700" />
            </button>
            {localValue !== value && (
              <button onClick={handleSave} aria-label="Confirm">
                <Check className="flex h-8 w-8 items-center justify-center rounded-full p-1 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700" />
              </button>
            )}
          </div>
        ) : (
          allowEdit && mode === 'edit' && (
            <IconWithTooltip
              id={`edit-${label.toLowerCase()}`}
              icon={Pencil}
              content={`Edit ${label}`}
              theme={theme}
              iconClassName="text-blue-500 h-4 w-4"
              onClick={() => setIsEditing(true)}
            />
          )
        )}
      </div>
      
      {isEditing ? (
        <>
          {multiline ? (
            <textarea
              value={localValue}
              onChange={handleChange}
              className="mt-1 w-full resize-none rounded border px-2 py-2 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
              rows={8}
              style={{ minHeight: "120px" }}
              maxLength={maxLength}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={localValue}
              onChange={handleChange}
              className="w-full rounded border px-2 py-1 text-xl"
              autoFocus
            />
          )}
          {charCounter && maxLength && (
            <div className="mt-1 flex justify-end text-xs">
              <span className={isLimitReached ? "font-semibold text-red-500" : "text-gray-500"}>
                {localValue.length}/{maxLength}
              </span>
            </div>
          )}
        </>
      ) : (
        multiline ? (
          <div
            className={cn(
              "mt-1 min-h-[120px] w-full rounded border bg-gray-50 px-2 py-2 transition-all",
              "text-sm",
              "border-gray-300",
              "dark:border-gray-600 dark:bg-[#282625]",
            )}
            style={{ whiteSpace: "pre-line" }}
          >
            {value || <span className="text-gray-400">No {label.toLowerCase()} yet...</span>}
          </div>
        ) : (
          <span className="text-xl font-bold">{value}</span>
        )
      )}
    </div>
  );
};

export default EditableTextField;