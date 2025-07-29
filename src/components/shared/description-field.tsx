import { useSafeThemeContext } from "@/context/safe-theme-context";
import React from "react";
import { useFormContext } from "react-hook-form";
import RequiredStar from "../required-star";
import IconWithTooltip from "../icon-with-tooltip";
import EditableInputField from "./editable-input-field";

interface DescriptionFieldProps {
  label?: string;
  tooltipContent?: string;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  minHeight?: string;
  tooltipId?: string;

  // For editable mode (projects, ideas)
  editable?: boolean;
  value?: string;
  originalValue?: string;
  onSave?: (value: string) => void;
  onCancel?: () => void;

  // For form mode (issue report)
  formMode?: boolean;
  fieldName?: string;
  showCharCount?: boolean;
}

const DescriptionField: React.FC<DescriptionFieldProps> = ({
  label = "Description",
  tooltipContent = "Provide details to help others understand",
  maxLength = 1000,
  required = false,
  placeholder = "Enter description...",
  minHeight = "120px",
  tooltipId = "description",

  editable = false,
  value,
  originalValue,
  onSave,
  onCancel,

  formMode = false,
  fieldName = "description",
  showCharCount = true,
}) => {
  const { theme } = useSafeThemeContext();

  const formContext = useFormContext();
  const watchedValue = formMode && formContext ? formContext.watch(fieldName, "") : value || "";
  const charCount = (typeof watchedValue === "string" ? watchedValue : "").length;
  const isLimitReached = maxLength && charCount >= maxLength;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">
          {label}
          {required && <RequiredStar />}
        </label>
        <IconWithTooltip theme={theme} id={tooltipId} tooltipPlacement="left" content={tooltipContent} />
      </div>

      {formMode && formContext ? (
        <>
          <textarea
            style={{ minHeight }}
            className={`w-full rounded border p-2 ${isLimitReached ? "border-red-400" : ""}`}
            placeholder={placeholder}
            maxLength={maxLength}
            {...formContext.register(fieldName, {
              required: required,
              maxLength: maxLength,
            })}
            rows={5}
          />
          {showCharCount && (
            <div className="mt-1 flex justify-end text-xs">
              <span className={isLimitReached ? "font-semibold text-red-500" : "text-gray-500"}>
                {charCount}/{maxLength}
              </span>
            </div>
          )}
        </>
      ) : (
        <EditableInputField
          value={value || ""}
          originalValue={originalValue || ""}
          onSave={onSave || (() => {})}
          onCancel={onCancel}
          isEditable={editable}
          theme={theme}
          editTooltip={`Edit ${label}`}
          multiline={true}
          maxLength={maxLength}
          placeholder={placeholder}
          displayClassName={`mt-1 min-h-[${minHeight}] w-full rounded border bg-gray-50 px-2 py-2 transition-all text-sm border-gray-300 dark:border-gray-600 dark:bg-[#282625]`}
          inputClassName="mt-1 w-full resize-none rounded border px-2 py-2 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      )}
    </div>
  );
};

export default DescriptionField;
