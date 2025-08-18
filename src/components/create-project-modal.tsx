"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateProjectForm from "./create-project-form";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose, onProjectCreated }) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl rounded-2xl overflow-y-auto nf-scrollbar">
        <DialogHeader  className="mb-4">
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <CreateProjectForm onSuccess={() => {
          onClose();
          onProjectCreated();
        }} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
