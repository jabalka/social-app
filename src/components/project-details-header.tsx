import { Project } from "@/models/project.types";
import EditableInputField from "./shared/editable-input-field";


interface ProjectHeaderProps {
  project: Project;
  titleInput: string;
  setTitleInput: (title: string) => void;
  editingTitle: boolean;
  setEditingTitle: (editing: boolean) => void;
  isEditable: boolean;
  theme: string;
  titleChanged: boolean;
  setTitleChanged: (changed: boolean) => void;
  onCancel?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  titleInput,
  setTitleInput,
  isEditable,
  theme,
  setTitleChanged,
  onCancel,
}) => {
  // Use the parent component's state instead of local state
  const handleSaveTitle = (newTitle: string) => {
    setTitleInput(newTitle);
    setTitleChanged(newTitle !== project.title);
  };

  return (
    <>
      <div className="mb-2 mt-2 flex items-center gap-2">
        <label className="text-sm font-medium">Project Title:</label>
        <EditableInputField 
          value={titleInput}
          originalValue={project.title}
          onSave={handleSaveTitle}
          isEditable={isEditable}
          theme={theme}
          editTooltip="Edit Title"
          onCancel={onCancel}
        />
      </div>

      <div className="mb-2">
        <span className="text-sm">
          <b>Postcode:</b> {project.postcode}
        </span>
      </div>
    </>
  );
};

export default ProjectHeader;