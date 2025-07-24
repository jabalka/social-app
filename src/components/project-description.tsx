import { Project } from "@/models/project.types";
import DescriptionField from "./shared/description-field";

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
  // theme,
  setDescriptionChanged,
  onCancel,
}) => {
  const handleSaveDescription = (newDescription: string) => {
    setDescriptionInput(newDescription);
    setDescriptionChanged(newDescription !== project.description);
  };

  return (
    <div className="mb-4">
      <DescriptionField
        label="Description"
        tooltipContent="Describe your project in detail"
        value={descriptionInput}
        originalValue={project.description}
        onSave={handleSaveDescription}
        onCancel={onCancel}
        editable={(isAuthor && isEditable) || isAdmin}
        // theme={theme}
        maxLength={5000}
        minHeight="120px"
      />
    </div>
  );
};

export default ProjectDescription;
