import { Project } from "@/models/project";

interface Props {
  project: Project;
  progressNotes: string;
  setProgressNotes: (notes: string) => void;
  allowEditProgressNotes: boolean;
  onCancel?: () => void;
}

const ProjectProgressNotes: React.FC<Props> = ({
  project,
  progressNotes,
  setProgressNotes,
  allowEditProgressNotes,
  // onCancel,
}) => {


  return (
    <div className="mb-4">
      <h3 className="font-semibold">Progress Notes</h3>
      {allowEditProgressNotes ? (
        <textarea
          className="mt-2 w-full rounded border p-2 text-sm"
          rows={3}
          value={progressNotes}
          onChange={(e) => setProgressNotes(e.target.value)}
          placeholder="Add progress notes..."
        />
      ) : (
        <p className="mt-1 text-xs text-gray-500">{project.progressNotes || "No notes yet"}</p>
      )}
    </div>
  );
};

export default ProjectProgressNotes;