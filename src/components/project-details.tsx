"use client";

import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { canEditCategories, canEditProgress, canEditProgressNotes, canEditStatus } from "@/lib/role-permissions";
import { AuthUser } from "@/models/auth";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import CommentCreation from "./create-comment";
import DragAndDropArea from "./drag-and-drop-area";
import GlowingProgressBar from "./glowing-progress-bar";
import GlowingVioletButton from "./glowing-violet-button";
import ProjectAllComments from "./project-all-comments";

import { Project } from "@/models/project";
import GlowingGreenButton from "./glowing-green-button";
import GlowingPinkButton from "./glowing-pink-button";
import ModalOverlay from "./modal-overlay";
import { useSocketContext } from "@/context/socket-context";

interface ProjectDetailsDialogProps {
  user: AuthUser;
  project: Project;
  open: boolean;
  onClose: () => void;
  refreshProjects: () => void;
  theme: string;
}

const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({
  user,
  project,
  open,
  onClose,
  refreshProjects,
  theme,
}) => {
  const isAuthor = user.id === project.author.id;
  const isEditable = project.status === "PROPOSED";
  const canAddImages = project.status === "PROPOSED" || project.status === "IN_PROGRESS";
  //   const isReadOnly = project.status === "COMPLETED";
  const allowEditProgressNotes = canEditProgressNotes(user.roleId);
  const allowEditProgress = canEditProgress(user.roleId);
  const allowEditStatus = canEditStatus(user.roleId);
  const allowEditCategories = canEditCategories(user.roleId);

  const { socket } = useSocketContext();

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [progressNotes, setProgressNotes] = useState(project.progressNotes || "");
  const [progress, setProgress] = useState(project.progress ?? 0);
  const [status, setStatus] = useState(project.status);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(project.categories.map((cat) => cat.id));
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [triggerChange, setTriggerChange] = useState(0);
  const [likes, setLikes] = useState(project.likes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  const fetchLikes = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/like`);
      if (res.ok) {
        const data = await res.json();
        setLikes(data);
      }
    } catch (err) {
      console.error("Failed to fetch likes:", err);
    }
  }, [project.id]);

  const handleLike = async () => {
    setAnimationKey(Date.now());
    if (!user.id || isLiking) return;
    setIsLiking(true);

    try {
      // if liked the socket event should not be emmitted
      socket?.emit("project:like", { projectId: project.id, userId: user.id });
      const alreadyLiked = likes.some((like) => like.userId === user.id);
      let newLikes;
      if (alreadyLiked) {
        newLikes = likes.filter((like) => like.userId !== user.id);
      } else {
        // Provide dummy id and createdAt for optimistic update
        newLikes = [
          ...likes,
          {
            id: `optimistic-${user.id}-${Date.now()}`,
            userId: user.id,
            createdAt: new Date(),
          },
        ];
      }
      setLikes(newLikes);
  
      const res = await fetch(`/api/projects/${project.id}/like`, { method: "POST" });
      if (res.ok) {
        fetchLikes();
        refreshProjects();
      } else {
        setLikes(likes); 
        console.error("Failed to like project");
      }
    } catch (err) {
      setLikes(likes); 
      console.error("Like error:", err);
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 3000); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  useEffect(() => {
    setLikes(project.likes || []);
  }, [project.likes]);

  useEffect(() => {
    fetchLikes();
    const interval = setInterval(fetchLikes, 60000);
    return () => clearInterval(interval);
  }, [fetchLikes]);

  useEffect(() => {
    if (uploadedFiles && uploadedFiles.length > 0) {
      // Force React to acknowledge the change
      setTriggerChange(Date.now());
    }
  }, [uploadedFiles]);

  const hasChanges =
    title !== project.title ||
    description !== project.description ||
    progressNotes !== (project.progressNotes || "") ||
    progress !== project.progress ||
    status !== project.status ||
    selectedCategoryIds.sort().join(",") !==
      project.categories
        .map((c) => c.id)
        .sort()
        .join(",") ||
    (uploadedFiles && uploadedFiles.length > 0) ||
    triggerChange > 0;

  const formMethods = useForm();
  const { handleSubmit } = formMethods;

  const handleSave = async () => {
    try {
      const payload: Record<string, string | number | string[]> = {
        title,
        description,
      };
      if (allowEditProgressNotes) payload.progressNotes = progressNotes;
      if (allowEditProgress) payload.progress = progress;
      if (allowEditStatus) payload.status = status;
      if (allowEditCategories) payload.categories = selectedCategoryIds;

      const patchRes = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const handleClose = async () => {
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
    <ModalOverlay open={open} onClose={handleClose}>
      <div
        className={cn("max-h-[90vh] max-w-2xl overflow-y-auto p-6", {
          "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
          "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
        })}
      >
        <h2 className="mb-2 text-2xl font-bold">
          {title}
          {isAuthor && isEditable && !editingTitle && (
            <button
              onClick={() => setEditingTitle(true)}
              className="ml-2 text-sm font-medium text-blue-500 hover:underline"
            >
              Edit
            </button>
          )}
        </h2>
        <p
          className={cn("text-sm", {
            "text-zinc-700": theme === Theme.LIGHT,
            "text-zinc-200": theme === Theme.DARK,
          })}
        >
          Postcode: {project.postcode}
        </p>

        {/* Category Icons */}
        <div className="mt-2 flex gap-2">
          {project.categories.map(({ id, name }) => {
            const matched = PROJECT_CATEGORIES.find((cat) => cat.id === id);
            const Icon = matched?.icon;

            return (
              Icon && (
                <div key={id} className="group relative flex items-center justify-center">
                  <Icon
                    className={cn("h-5 w-5", {
                      "text-gray-700 group-hover:text-orange-700": theme === Theme.LIGHT,
                      "text-zinc-200 group-hover:text-orange-700": theme === Theme.DARK,
                    })}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                    {name}
                  </div>
                </div>
              )
            );
          })}
        </div>

        {allowEditCategories && (
          <div className="mb-4">
            <h3 className="font-semibold">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {PROJECT_CATEGORIES.map((cat) => (
                <label key={cat.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => {
                      setSelectedCategoryIds((prev) =>
                        prev.includes(cat.id)
                          ? prev.filter((id) => id !== cat.id)
                          : prev.length < 3
                            ? [...prev, cat.id]
                            : prev,
                      );
                    }}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
        )}

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
            <p
              className={cn({
                "text-zinc-700": theme === Theme.LIGHT,
                "text-zinc-200": theme === Theme.DARK,
              })}
            >
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

        {/* Interaction buttons */}
        <div className="mt-4 flex justify-between gap-2">
          <div className="relative flex flex-col items-center">
            <span className="mb-1 text-sm">({likes.length}) Likes</span>
            <div className="relative inline-flex overflow-hidden rounded-full p-[4px]">
              {likes.some((like) => like.userId === user.id) ? (
                <GlowingGreenButton onClick={handleLike} className="w-32" disabled={isLiking}>
                  Liked
                </GlowingGreenButton>
              ) : (
                <GlowingPinkButton onClick={handleLike} className="w-32" disabled={isLiking}>
                  Like
                </GlowingPinkButton>
              )}
            </div>
          </div>
          <div className="relative flex flex-col items-center">
            <div className="mb-1 flex items-center gap-1 text-sm">
              ({project.comments.length})
              <button
                onClick={() => setShowAllComments(true)}
                className="text-xs text-blue-400 underline hover:text-blue-300"
              >
                All Comments
              </button>
            </div>
            {/* from-[#185b17] via-[#2a8829] to-[#185b17] */}

            <GlowingVioletButton onClick={() => setShowCommentModal(true)} className="w-32">
              Comment
            </GlowingVioletButton>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Status</h3>
          {allowEditStatus ? (
            <select
              className="mt-1 w-full rounded border p-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof project.status)}
            >
              <option value="PROPOSED">Proposed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          ) : (
            <p>
              {project.status
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Progress</h3>
          <GlowingProgressBar project={project} className="h-3 w-full border-[1px] border-gray-400 bg-gray-200" />

          <p
            className={cn("text-md mt-1 text-gray-500", {
              "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
              "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
            })}
          >
            {project.progress}% completed
          </p>

          {allowEditProgress && (
            <input
              type="number"
              min={0}
              max={100}
              className="mt-2 w-full rounded border p-2 text-sm"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              placeholder="Progress (0–100)"
            />
          )}

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

        {showCommentModal && (
          <ModalOverlay open={showCommentModal} onClose={() => setShowCommentModal(false)}>
            <CommentCreation
              user={user}
              projectId={project.id}
              onClose={() => setShowCommentModal(false)}
              theme={theme}
            />
          </ModalOverlay>
        )}

        {showAllComments && (
          <ModalOverlay open={showAllComments} onClose={() => setShowAllComments(false)}>
            <ProjectAllComments
              projectId={project.id}
              user={user}
              open={showAllComments}
              onClose={() => setShowAllComments(false)}
              theme={theme}
            />
          </ModalOverlay>
        )}
      </div>
    </ModalOverlay>
  );
};

export default ProjectDetailsDialog;
