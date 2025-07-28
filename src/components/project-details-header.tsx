import { Project } from "@/models/project.types";
import EditableInputField from "./shared/editable-input-field";

interface Props {
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

const ProjectDetailsHeader: React.FC<Props> = ({
  project,
  titleInput,
  setTitleInput,
  editingTitle,
  setEditingTitle,
  isEditable,
  theme,
  setTitleChanged,
  onCancel,
}) => {
  const handleSaveTitle = (newTitle: string) => {

    setTitleInput(newTitle);

    const hasChanged = newTitle !== project.title;

    setTitleChanged(hasChanged);
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
          isEditing={editingTitle}
          setIsEditing={setEditingTitle}
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

export default ProjectDetailsHeader;
