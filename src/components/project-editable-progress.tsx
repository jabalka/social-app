import { cn } from "@/utils/cn.utils";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Theme } from "@/types/theme.enum";
import React from "react";
import TooltipBubble from "./tooltip-bubble";
import IconWithTooltip from "./tooltip-with-icon";
import GlowingProgressBar from "./glowing-progress-bar";
import { Project } from "@/models/project.types";

interface EditableProgressProps {
  mode: 'view' | 'edit';
  progress: number;
  projectData: { [key: string]: string | number | boolean | undefined; progress: number }; // for GlowingProgressBar
  theme: string;
  onChange?: (progress: number) => void;
  allowEdit?: boolean;
}

const EditableProgress: React.FC<EditableProgressProps> = ({
  mode,
  progress,
  projectData,
  theme,
  onChange,
  allowEdit = false
}) => {
  const [localProgress, setLocalProgress] = useState(progress);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleIncrease = () => {
    setLocalProgress(Math.min(100, localProgress + 5));
  };
  
  const handleDecrease = () => {
    setLocalProgress(Math.max(0, localProgress - 5));
  };
  
  const handleSave = () => {
    setIsEditing(false);
    if (onChange && localProgress !== progress) {
      onChange(localProgress);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setLocalProgress(progress);
  };

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Progress</h3>

          {isEditing && (
            <>
              <button
                onClick={handleDecrease}
                disabled={localProgress <= 0}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  localProgress <= 0 ? "cursor-not-allowed opacity-50" : "hover:bg-red-100",
                )}
              >
                <div className="group relative">
                  <span className="text-lg font-bold text-red-600">-</span>
                  <TooltipBubble theme={theme} content="Decrease" placement="top" />
                </div>
              </button>

              <button
                onClick={handleIncrease}
                disabled={localProgress >= 100}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  localProgress >= 100 ? "cursor-not-allowed opacity-50" : "hover:bg-green-100",
                )}
              >
                <div className="group relative">
                  <span className="text-lg font-bold text-green-600">+</span>
                  <TooltipBubble theme={theme} content="Increase" placement="top" />
                </div>
              </button>
            </>
          )}
        </div>

        {/* Control buttons section */}
        <div className="flex items-center gap-2">
          {/* Edit button - only shown when not editing */}
          {allowEdit && !isEditing && mode === 'edit' && (
            <IconWithTooltip
              id="edit-progress"
              icon={Pencil}
              content="Edit Progress"
              theme={theme}
              tooltipPlacement="top"
              iconClassName="text-blue-500 h-4 w-4"
              onClick={() => setIsEditing(true)}
            />
          )}

          {/* Save/Cancel buttons - only shown when editing */}
          {isEditing && (
            <>
              <button
                onClick={handleCancel}
                className="rounded-full p-1 transition-colors"
              >
                <X className="flex h-8 w-8 items-center justify-center rounded-full p-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700" />
              </button>
              {localProgress !== progress && (
                <button
                  onClick={handleSave}
                  className="rounded-full p-1 transition-colors"
                >
                  <Check className="flex h-8 w-8 items-center justify-center rounded-full p-1 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <GlowingProgressBar
        project={{ ...(projectData), progress: localProgress } as Project}
        className="h-3 w-full border-[1px] border-gray-400 bg-gray-200"
      />

      <p
        className={cn("text-md mt-1 text-gray-500", {
          "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
          "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
        })}
      >
        {localProgress}% completed
      </p>
    </div>
  );
};

export default EditableProgress;