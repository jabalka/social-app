import { Project } from "@/models/project.types";
import { useState, useEffect } from "react";
import Image from "next/image";
import TooltipBubble from "./tooltip-bubble";
import IconWithTooltip from "./icon-with-tooltip";

import { Pencil } from "lucide-react";
import CancelEditButton from "./shared/cancel-edit-button";
import KeepEditButton from "./shared/keep-edit-button";

type ProjectStatusType = "PROPOSED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";

interface ProjectStatusProps {
  project: Project;
  status: ProjectStatusType;
  setStatus: (status: ProjectStatusType) => void;
  editingStatus: boolean;
  setEditingStatus: (editing: boolean) => void;
  theme: string;
  setStatusChanged: (changed: boolean) => void;
  allowEditStatus: boolean;
  onCancel?: () => void;

}

const ProjectStatus: React.FC<ProjectStatusProps> = ({
  project,
  status,
  setStatus,
  editingStatus,
  setEditingStatus,
  theme,
  setStatusChanged,
  allowEditStatus,
  onCancel,
}) => {
  const [localStatus, setLocalStatus] = useState(status);
  
  // Update local status when parent status changes
  useEffect(() => {
    setLocalStatus(status);
  }, [status]);
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "PROPOSED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
    setLocalStatus(newStatus);
  };

  const handleSave = () => {
    setStatus(localStatus);
    setStatusChanged(localStatus !== project.status);
    setEditingStatus(false);
  };

  const handleCancel = () => {
    setLocalStatus(project.status);
    setEditingStatus(false);

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-sm font-semibold">Status:</span>

      <div className="group relative flex items-center">
        <Image
          src={`/images/${
            localStatus === "COMPLETED"
              ? "project-completed.png"
              : localStatus === "IN_PROGRESS"
                ? "project-in-progress.png"
                : localStatus === "REJECTED"
                  ? "marker-icon.png"
                  : "project-proposed.png"
          }`}
          alt={localStatus}
          width={20}
          height={20}
          className="h-8 w-8 object-contain"
        />
        <TooltipBubble theme={theme} content={localStatus.replace("_", " ")} placement="top" />
      </div>

      {allowEditStatus && !editingStatus && (
        <IconWithTooltip
          id="edit-status"
          icon={Pencil}
          content="Edit Status"
          theme={theme}
          tooltipPlacement="top"
          iconClassName="text-blue-500 h-4 w-4"
          onClick={() => setEditingStatus(true)}
        />
      )}
      
      {allowEditStatus && editingStatus && (
        <>
          <select value={localStatus} onChange={handleStatusChange} className="rounded border px-2 py-1">
            <option value="PROPOSED">Proposed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <div className="flex gap-1">
            <CancelEditButton onClick={handleCancel} />
            {localStatus !== project.status && (
              <KeepEditButton onClick={handleSave} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectStatus;