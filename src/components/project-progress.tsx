import { Project } from "@/models/project";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { useState, useEffect } from "react";
import TooltipBubble from "./tooltip-bubble";
import IconWithTooltip from "./tooltip-with-icon";
import GlowingProgressBar from "./glowing-progress-bar";
import CancelEditButton from "./shared/cancel-edit-button";
import KeepEditButton from "./shared/keep-edit-button";
import { Pencil } from "lucide-react";


interface ProjectProgressProps {
  project: Project;
  progress: number;
  setProgress: (progress: number) => void;
  editingProgress: boolean;
  setEditingProgress: (editing: boolean) => void;
  theme: string;
  setProgressChanged: (changed: boolean) => void;
  allowEditProgress?: boolean;
  onCancel?: () => void;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({
  project,
  progress,
  setProgress,
  editingProgress,
  setEditingProgress,
  theme,
  setProgressChanged,
  allowEditProgress = false,
  onCancel,
}) => {
  // Use parent state instead of local state
  const [localProgress, setLocalProgress] = useState(progress);
  
  // Update local progress when parent progress changes
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  const handleIncrease = () => {
    setLocalProgress(Math.min(100, localProgress + 5));
  };

  const handleDecrease = () => {
    setLocalProgress(Math.max(0, localProgress - 5));
  };

  const handleSave = () => {
    setProgress(localProgress);
    setProgressChanged(localProgress !== (project.progress ?? 0));
    setEditingProgress(false);
  };

  const handleCancel = () => {
    setLocalProgress(project.progress ?? 0);
    setEditingProgress(false);

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Progress</h3>

          {editingProgress && (
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

        <div className="flex items-center gap-2">
          {allowEditProgress && !editingProgress && (
            <IconWithTooltip
              id="edit-progress"
              icon={Pencil}
              content="Edit Progress"
              theme={theme}
              tooltipPlacement="top"
              iconClassName="text-blue-500 h-4 w-4"
              onClick={() => setEditingProgress(true)}
            />
          )}

          {editingProgress && (
            <>
              <CancelEditButton onClick={handleCancel} />
              {localProgress !== (project.progress ?? 0) && (
                <KeepEditButton onClick={handleSave} />
              )}
            </>
          )}
        </div>
      </div>

      <GlowingProgressBar
        project={{ ...project, progress: localProgress }}
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

export default ProjectProgress;