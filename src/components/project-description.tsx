import { Project } from "@/models/project";
import EditableInputField from "./shared/editable-input-field";

interface ProjectDescriptionProps {
  project: Project;
  descriptionInput: string;
  setDescriptionInput: (description: string) => void;
  isAuthor: boolean;
  isAdmin: boolean;
  isEditable: boolean;
  theme: string;
  setDescriptionChanged: (changed: boolean) => void;
  onCancel?: () => void;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  project,
  descriptionInput,
  setDescriptionInput,
  isAuthor,
  isAdmin,
  isEditable,
  theme,
  setDescriptionChanged,
  onCancel,
}) => {
  const handleSaveDescription = (newDescription: string) => {
    setDescriptionInput(newDescription);
    setDescriptionChanged(newDescription !== project.description);
  };

  const handleCancelEdit = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-start justify-between">
        <label className="mb-1 text-sm font-medium">Description:</label>
      </div>
      <EditableInputField 
        value={descriptionInput}
        originalValue={project.description}
        onSave={handleSaveDescription}
        onCancel={handleCancelEdit} 
        isEditable={(isAuthor && isEditable) || isAdmin}
        theme={theme}
        editTooltip="Edit Description"
        multiline={true}
        displayClassName="mt-1 min-h-[120px] w-full rounded border bg-gray-50 px-2 py-2 transition-all text-sm border-gray-300 dark:border-gray-600 dark:bg-[#282625]"
        inputClassName="mt-1 w-full resize-none rounded border px-2 py-2 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    </div>
  );
};

export default ProjectDescription;