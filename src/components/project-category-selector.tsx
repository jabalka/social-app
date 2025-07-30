import React from "react";
import { Control, FieldValues } from "react-hook-form";
import CategorySelectorForm from "./category-selector-form";
import CategorySelectorView from "./category-selector-view";

interface Props {
  mode: "create" | "view" | "edit";
  theme: string;
  control?: Control<FieldValues>;
  watchedCategories: string[];
  onCategoriesChange?: (categories: string[]) => void;
  displayCategories?: { id: string; name: string }[];
  allowEdit?: boolean;
  required?: boolean;
  onEditComplete?: (categories: string[]) => void;
  onCancel?: () => void;
}

const CategorySelector: React.FC<Props> = (props) => {
  const { mode, control } = props;

  if (mode === "view") {
    return <CategorySelectorView {...props} />;
  }

  if (!control) {
    console.error("CategorySelector: 'control' prop is required for mode 'edit' or 'create'");
    return null;
  }

  return <CategorySelectorForm {...props} mode={mode} control={control} />;
};

export default CategorySelector;
