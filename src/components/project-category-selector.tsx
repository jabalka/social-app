import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { cn } from "@/utils/cn.utils";
import { Controller, useWatch } from "react-hook-form";

import { Check, Pencil, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import RequiredStar from "./required-star";
import TooltipBubble from "./tooltip-bubble";
import IconWithTooltip from "./tooltip-with-icon";

import { Control, FieldValues } from "react-hook-form";

interface CategorySelectorProps {
  mode: "create" | "view" | "edit";
  theme: string;
  control: Control<FieldValues>;
  watchedCategories: string[];
  onCategoriesChange?: (categories: string[]) => void;
  displayCategories?: { id: string; name: string }[];
  allowEdit?: boolean;
  required?: boolean;
  onEditComplete?: (categories: string[]) => void;
  onCancel?: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  mode,
  theme,
  control,
  watchedCategories,
  onCategoriesChange,
  displayCategories = [],
  allowEdit = false,
  required,
  onEditComplete,
  onCancel,
}) => {
  const [editMode, setEditMode] = useState(false);

  const currentCategories = useWatch({
    control,
    name: "categories",
    defaultValue: watchedCategories || [],
  });

  useEffect(() => {
    if (onCategoriesChange && JSON.stringify(currentCategories) !== JSON.stringify(watchedCategories)) {
      console.log("Categories changed in form, notifying parent:", currentCategories);
      onCategoriesChange(currentCategories);
    }
  }, [currentCategories, watchedCategories, onCategoriesChange]);

  const handleApplyCategories = () => {
    setEditMode(false);
    if (onEditComplete) {
      console.log("Applying categories from form:", currentCategories);
      onEditComplete(currentCategories);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (onCancel) {
      onCancel();
    }
  };

  // Display mode - just show icons with tooltips
  if (mode === "view" || (mode === "edit" && !editMode)) {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Categories:</span>

          {displayCategories.map(({ id, name }) => {
            const matched = PROJECT_CATEGORIES.find((cat) => cat.id === id);
            const Icon = matched?.icon;
            return (
              Icon && (
                <IconWithTooltip key={id} id={id} icon={Icon} content={name} theme={theme} iconClassName="h-5 w-5" />
              )
            );
          })}

          {allowEdit && mode === "edit" && (
            <IconWithTooltip
              id="edit-categories"
              icon={Pencil}
              content="Edit Categories"
              theme={theme}
              tooltipPlacement="top"
              iconClassName="text-blue-500 h-4 w-4"
              onClick={() => setEditMode(true)}
            />
          )}
        </div>
      </div>
    );
  }

  // Edit or Create mode - show checkboxes
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">
          Categories
          {required && <RequiredStar />}
        </label>
        <span className="text-xs text-gray-500">Select up to 3</span>
      </div>

      <div className="flex flex-wrap gap-4">
        {PROJECT_CATEGORIES.map((cat) => {
          // FIXED: Use currentCategories instead of watchedCategories for disabled state
          const isDisabled = currentCategories.length >= 3 && !currentCategories.includes(cat.id);

          return (
            <div key={cat.id} className={cn("relative", { group: isDisabled })}>
              <label
                className={cn("flex items-center gap-2 text-sm transition-opacity", {
                  "cursor-pointer": !isDisabled,
                  "cursor-not-allowed opacity-50": isDisabled,
                })}
              >
                <Controller
                  control={control}
                  name="categories"
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      value={cat.id}
                      checked={field.value?.includes(cat.id)}
                      disabled={isDisabled}
                      className={cn({
                        "cursor-pointer": !isDisabled,
                        "cursor-not-allowed": isDisabled,
                      })}
                      onChange={(e) => {
                        let newCategories;
                        if (e.target.checked) {
                          if ((field.value || []).length < 3) {
                            newCategories = [...(field.value || []), cat.id];
                            field.onChange(newCategories);
                            console.log("CHECKBOX CHECKED - New categories:", newCategories);
                          }
                        } else {
                          newCategories = (field.value || []).filter((id: string) => id !== cat.id);
                          field.onChange(newCategories);
                          console.log("CHECKBOX UNCHECKED - New categories:", newCategories);
                        }
                      }}
                    />
                  )}
                />
                <div className={cn("flex items-center gap-1", { "cursor-not-allowed": isDisabled })}>
                  {cat.icon && <cat.icon className={cn("h-5 w-5", { "text-gray-400": isDisabled })} />}
                  <span>{cat.name}</span>
                </div>
              </label>

              {/* Custom tooltip for disabled state */}
              {isDisabled && <TooltipBubble theme={theme} content="Max. 3 allowed" placement="top" className="z-50" />}
            </div>
          );
        })}
      </div>

      {/* Action buttons for edit mode */}
      {mode === "edit" && (
        <div className="mt-3 flex gap-2">
          <div className="group relative">
            <button onClick={handleCancelEdit} className="rounded-full p-1 transition-colors">
              <X className="flex h-8 w-8 items-center justify-center rounded-full p-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700" />
            </button>
            <TooltipBubble theme={theme} content="Cancel" placement="top" />
          </div>

          <div className="group relative">
            <button onClick={handleApplyCategories} className="rounded-full p-1 transition-colors">
              <Check className="flex h-8 w-8 items-center justify-center rounded-full p-1 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700" />
            </button>
            <TooltipBubble theme={theme} content="Save" placement="top" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
