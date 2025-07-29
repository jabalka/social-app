"use client";
import IconWithTooltip from "@/components/icon-with-tooltip";
import CancelEditButton from "@/components/shared/cancel-edit-button";
import KeepEditButton from "@/components/shared/keep-edit-button";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Pencil } from "lucide-react";
import React, { useState } from "react";

interface EditableFieldProps {
  label: string;
  value: string;
  originalValue: string;
  theme: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  validate?: (value: string) => string | null;
  maxLength?: number;
}

const ProfileEditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  originalValue,
  theme,
  onSave,
  onCancel,
  validate,
  maxLength,
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\s{2,}/g, " ");
    setInputValue(newValue);
    if (validate) {
      setError(validate(newValue));
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setInputValue(value);
    setError(null);
    onCancel();
  };

  const handleConfirm = () => {
    if (!error) {
      setEditing(false);
      onSave(inputValue);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
      <label className="text-sm font-medium">{label}:</label>
      <div className="flex max-w-52 items-center gap-2">
        {editing ? (
          <>
            <div className="group relative">
              <input
                value={inputValue}
                onChange={handleInputChange}
                className="group max-w-40 rounded border px-2 py-1 text-sm"
                maxLength={maxLength}
              />
              {error && (
                <div
                  className={cn(
                    "absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs font-semibold transition-all duration-200",
                    {
                      "scale-100 opacity-100": !!error,
                      "scale-0 opacity-0": !error,
                      "bg-[#dbccc5] text-red-500": theme === Theme.LIGHT,
                      "bg-[#5e5753] text-red-500": theme === Theme.DARK,
                    },
                  )}
                >
                  {error}
                </div>
              )}
            </div>
          </>
        ) : (
          <span>
            {value || (
              <span
                className={cn({
                  "text-zinc-300": theme === Theme.LIGHT,
                  "text-zinc-700": theme === Theme.DARK,
                })}
              >
                -- N/A --
              </span>
            )}
          </span>
        )}
        {editing ? (
          <>
            <CancelEditButton onClick={handleCancel} size="sm" />
            {inputValue !== originalValue && !error && <KeepEditButton onClick={handleConfirm} size="sm" />}
          </>
        ) : (
          <IconWithTooltip
            id={`edit-${label.toLowerCase()}`}
            icon={Pencil}
            content={`Edit ${label}`}
            theme={theme}
            iconClassName="text-blue-500 h-4 w-4"
            onClick={() => setEditing(true)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileEditableField;
