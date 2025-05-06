"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // or use your dialog system
import { User } from "next-auth";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DragAndDropArea from "./drag-and-drop-area";
import { Project } from "./map-wrapper-viewer";

interface ProjectDetailsDialogProps {
  user: User;
  project: Project;
  open: boolean;
  onClose: () => void;
refreshProjects(): void
}

const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({
  user,
  project,
  open,
  onClose,
  refreshProjects
}) => {
  const isAuthor = user.id === project.author.id;
  const isEditable = project.status === "PROPOSED";
  const canAddImages = project.status === "PROPOSED" || project.status === "IN_PROGRESS";
  //   const isReadOnly = project.status === "COMPLETED";

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [triggerChange, setTriggerChange] = useState(0);

  useEffect(() => {
    if (uploadedFiles && uploadedFiles.length > 0) {
      // Force React to acknowledge the change
      setTriggerChange(Date.now());
    }
  }, [uploadedFiles]);

  const hasChanges =
    title !== project.title ||
    description !== project.description ||
    (uploadedFiles && uploadedFiles.length > 0) ||
    triggerChange > 0;

  const formMethods = useForm();
  const { handleSubmit } = formMethods;

  const handleSave = async () => {
    try {
      const patchRes = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!patchRes.ok) throw new Error("Failed to update project");

      if (uploadedFiles && uploadedFiles.length > 0) {
        const uploadedUrls: string[] = [];

        for (const file of Array.from(uploadedFiles).slice(0, 10)) {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("projectId", project.id);

          const res = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            uploadedUrls.push(data.url);
          } else {
            console.error("Image upload failed");
          }
        }

        await fetch(`/api/projects/${project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newImageUrls: uploadedUrls, deletedImageUrls: [] }),
        });
      }

      refreshProjects();
      onClose();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!open) {
      setEditingTitle(false);
      setEditingDescription(false);
      setShowUnsavedPrompt(false);
      setTitle(project.title);
      setDescription(project.description);
      setDeleteInput("");
      setShowUploader(false);
      setPreviewUrls([]);
      setUploadedFiles(null);
    }
  }, [open, project]);

  const handleDelete = async () => {
    if (deleteInput === "delete project") {
      // add your delete logic here
      console.log("Project deleted");
      refreshProjects();
    } else {
      alert("You must type 'delete project' to confirm.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-6">
        <DialogTitle className="sr-only">Project Details</DialogTitle>
        <div className="mb-4">
          {isAuthor && isEditable && editingTitle ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-2 w-full rounded border p-2 text-xl font-bold"
            />
          ) : (
            <h2 className="mb-2 text-2xl font-bold">
              {title}
              {isAuthor && isEditable && !editingTitle && (
                <button onClick={() => setEditingTitle(true)} className="ml-2 text-sm text-blue-500 hover:underline">
                  Edit
                </button>
              )}
            </h2>
          )}
          <p className="text-sm text-gray-500">Postcode: {project.postcode}</p>
        </div>

        <div className="mb-4">
          <h3 className="mb-1 font-semibold">Description</h3>
          {isAuthor && isEditable && editingDescription ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded border p-2"
            />
          ) : (
            <p className="text-gray-700">
              {description}
              {isAuthor && isEditable && !editingDescription && (
                <button
                  onClick={() => setEditingDescription(true)}
                  className="ml-2 text-sm text-blue-500 hover:underline"
                >
                  Edit
                </button>
              )}
            </p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Status</h3>
          <p>{project.status}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Progress</h3>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${project.progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">{project.progressNotes || "No notes yet"}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Images</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.images.map((img) => (
              <Image
                key={img.id}
                src={img.url}
                alt="Project Image"
                width={100}
                height={100}
                className="rounded object-cover"
              />
            ))}
          </div>

          {isAuthor && canAddImages && !showUploader && (
            <button onClick={() => setShowUploader(true)} className="mt-2 text-sm text-blue-500 hover:underline">
              Add Images
            </button>
          )}
          <FormProvider {...formMethods}>
            {isAuthor && canAddImages && showUploader && (
              <div className="mt-2">
                <DragAndDropArea name="images" previewUrls={previewUrls} onPreviewUrlsChange={setPreviewUrls} />
                <input
                  type="file"
                  multiple
                  hidden
                  {...formMethods.register("images", {
                    onChange: (e) => setUploadedFiles(e.target.files),
                  })}
                />
              </div>
            )}
          </FormProvider>
        </div>

        {isAuthor && !showDeleteSection && (
          <button onClick={() => setShowDeleteSection(true)} className="mt-6 text-sm text-red-600 hover:underline">
            Delete Project
          </button>
        )}

        {isAuthor && showDeleteSection && (
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
            <button
              onClick={handleDelete}
              className="mt-2 rounded bg-red-500 px-4 py-1 text-sm text-white hover:bg-red-600"
            >
              Confirm Delete
            </button>
          </div>
        )}

        {hasChanges && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => onClose()}
              className="rounded border px-4 py-1 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(handleSave)}
              className="rounded bg-green-600 px-4 py-1 text-sm text-white hover:bg-green-700"
            >
              Save
            </button>
          </div>
        )}

        {showUnsavedPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded bg-white p-6 shadow">
              <h4 className="mb-2 text-lg font-semibold">Unsaved Changes</h4>
              <p className="mb-4 text-sm text-gray-600">You have unsaved changes. Are you sure you want to close?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUnsavedPrompt(false)}
                  className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowUnsavedPrompt(false);
                    onClose();
                  }}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsDialog;
