import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import React from "react";
import IconWithTooltip from "./icon-with-tooltip";

interface CategorySelectorViewProps {
  theme: string;
  displayCategories?: { id: string; name: string }[];
  watchedCategories?: string[]; 
}

const CategorySelectorView: React.FC<CategorySelectorViewProps> = ({
  theme,
  displayCategories = [],
}) => {
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
      </div>
    </div>
  );
};

export default CategorySelectorView;