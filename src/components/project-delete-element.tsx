import { useState } from "react";

import { Trash } from "lucide-react";
import React from "react";
import IconWithTooltip from "./tooltip-with-icon";
import GlowingPinkButton from "./shared/glowing-pink-button";

interface ProjectDeleteProps {
  showDeleteSection: boolean;
  setShowDeleteSection: (show: boolean) => void;
  theme: string;
  projectId: string;
  refreshProjects: () => void;
}

const ProjectDelete: React.FC<ProjectDeleteProps> = ({
  showDeleteSection,
  setShowDeleteSection,
  theme,
  projectId,
  refreshProjects
}) => {
  const [deleteInput, setDeleteInput] = useState("");

  const handleProjectDelete = async () => {
    if (deleteInput === "delete project") {
      try {
        await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        });
        refreshProjects();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    } else {
      alert("You must type 'delete project' to confirm.");
    }
  };

  return (
    <>
      <div className="absolute left-2 top-2 flex items-center">
        <IconWithTooltip
          id="delete-project"
          icon={Trash}
          content="Delete Project"
          theme={theme}
          iconClassName="text-red-700 hover:text-red-900"
          onClick={() => setShowDeleteSection(true)}
        />
      </div>

      {showDeleteSection && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold text-red-600">Delete Project</h3>
          <p className="mb-2 text-sm text-gray-600">
            To delete, type <span className="font-mono">&quot;delete project&quot;</span>
          </p>
          <input
            type="text"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            placeholder="Type here..."
            className="w-full rounded border p-2"
          />
          <GlowingPinkButton onClick={handleProjectDelete} className="mt-2 text-sm">
            Confirm Delete
          </GlowingPinkButton>
          <button onClick={() => setShowDeleteSection(false)} className="ml-3 text-xs text-gray-600 underline">
            Cancel
          </button>
        </div>
      )}
    </>
  );
};

export default ProjectDelete;