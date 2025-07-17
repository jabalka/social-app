"use client";

import { useProjectContext } from "@/context/project-context";
import { useSocketContext } from "@/context/socket-context";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import {
  canEditCategories,
  canEditImages,
  canEditProgress,
  canEditProgressNotes,
  canEditStatus,
} from "@/lib/role-permissions";
import { AuthUser } from "@/models/auth";
import { Project } from "@/models/project";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Check, ChevronLeft, ChevronRight, Pencil, Trash, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CommentCreation from "./create-comment";
import GlowingGreenButton from "./glowing-green-button";
import GlowingPinkButton from "./glowing-pink-button";
import GlowingProgressBar from "./glowing-progress-bar";
import GlowingVioletButton from "./glowing-violet-button";
import ModalOverlay from "./modal-overlay";
import ProjectAllComments from "./project-all-comments";
import TooltipBubble from "./tooltip-bubble";
import TooltipWithIcon from "./tooltip-with-icon";

interface UploadedImageResponse {
  url: string;
}

interface PatchPayload {
  title?: string;
  description?: string;
  progressNotes?: string;
  progress?: number;
  status?: string;
  categories?: string[];
  newImageUrls?: string[];
  removeImageUrls?: string[];
}

interface ProjectDetailsDialogProps {
  user: AuthUser;
  project: Project;
  open: boolean;
  onClose: () => void;
  theme: string;
}

type ProjectImage = { id?: string; url: string };

const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({ user, project, open, onClose, theme }) => {
  const isAuthor = user.id === project.author.id;
  const isAdmin = user.roleId === "admin";
  const isEditable = project.status === "PROPOSED";

  const allowEditProgressNotes = canEditProgressNotes(user.roleId);
  const allowEditProgress = canEditProgress(user.roleId);
  const allowEditStatus = canEditStatus(user.roleId);
  const allowEditCategories = canEditCategories(user.roleId);
  const allowEditImages =
    canEditImages(user.roleId) || (isAuthor && (project.status === "PROPOSED" || project.status === "IN_PROGRESS"));

  const { refreshProjects } = useProjectContext();
  const { socket } = useSocketContext();
  const { confirm } = useConfirmation();

  // --- FORM ---
  const { control, setValue, watch } = useForm({
    defaultValues: { categories: project.categories.map((cat) => cat.id) },
  });
  const watchedCategories = watch("categories") || [];

  // Image and preview management
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State for preview/zoom/edit image UX
  const [zoomedImage, setZoomedImage] = useState<ProjectImage | null>(null);
  const [editImages, setEditImages] = useState(false);
  const [editCategories, setEditCategories] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);

  const [titleInput, setTitleInput] = useState(project.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleChanged, setTitleChanged] = useState(false);

  const [descriptionInput, setDescriptionInput] = useState(project.description);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionChanged, setDescriptionChanged] = useState(false);

  const [displayCategories, setDisplayCategories] = useState<{id: string; name: string}[]>(project.categories);
  const [progressNotes, setProgressNotes] = useState(project.progressNotes || "");
  const [progress, setProgress] = useState(project.progress ?? 0);
  const [status, setStatus] = useState(project.status);

  const [statusChanged, setStatusChanged] = useState(false);
  const [categoriesChanged, setCategoriesChanged] = useState(false);

  const [deleteInput, setDeleteInput] = useState("");
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [likes, setLikes] = useState(project.likes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Images for carousel: existing minus deleted + new ones (not-yet-uploaded)
  const existingImages: ProjectImage[] = (project.images || [])
    .filter((img) => !removedImageUrls.includes(img.url))
    .map((img) => ({ id: img.id, url: img.url }));

  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const imagesCount = existingImages.length;
  const visibleImages = 3;
  const displayedImages = (() => {
    if (imagesCount <= visibleImages) return existingImages;
    return Array.from({ length: visibleImages }).map((_, i) => existingImages[(carouselIndex + i) % imagesCount]);
  })();

  const handlePrev = () => setCarouselIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
  const handleNext = () => setCarouselIndex((prev) => (prev + 1) % imagesCount);

  // Like logic
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

  useEffect(() => {
    if (animationKey === 0) return;
    const timeout = setTimeout(() => setAnimationKey(0), 3000);
    return () => clearTimeout(timeout);
  }, [animationKey]);

  useEffect(() => setLikes(project.likes || []), [project.likes]);

  useEffect(() => {
    fetchLikes();
    const interval = setInterval(fetchLikes, 60000);
    return () => clearInterval(interval);
  }, [fetchLikes]);

  useEffect(() => {
    if (!open) {
      setTitleInput(project.title);
      setTitleChanged(false);
      setEditingTitle(false);
      setDescriptionInput(project.description);
      setDescriptionChanged(false);
      setEditingDescription(false);
      setDeleteInput("");
      setCarouselIndex(0);
      setNewImages([]);
      setRemovedImageUrls([]);
      setEditCategories(false);
      setStatusChanged(false);
      setCategoriesChanged(false);
      setValue(
        "categories",
        project.categories.map((cat) => cat.id),
      );
    }
    // eslint-disable-next-line
  }, [open, project]);

  const applyCategories = () => {
    setEditCategories(false);

    if (
      watchedCategories.sort().join(",") !==
      project.categories
        .map((c) => c.id)
        .sort()
        .join(",")
    ) {
      // Find the full category objects for the selected ids
      const newCategories = watchedCategories.map((id) => {
        const category = PROJECT_CATEGORIES.find((cat) => cat.id === id);
        return {
          id,
          name: category?.name || "",
        };
      });

      setDisplayCategories(newCategories);
      setCategoriesChanged(true);
    }
  };

  // Function to cancel category editing
  const cancelCategoryEdit = () => {
    setEditCategories(false);
    setValue(
      "categories",
      project.categories.map((cat) => cat.id),
    );
    // Don't change displayCategories here - keep what was there before editing
  };

  const anyFieldChanged =
    (isAuthor && titleChanged) ||
    (isAuthor && descriptionChanged) ||
    (allowEditProgressNotes && progressNotes !== (project.progressNotes || "")) ||
    (allowEditProgress && progress !== (project.progress ?? 0)) ||
    (allowEditStatus && (status !== project.status || statusChanged)) ||
    (allowEditCategories &&
      (categoriesChanged ||
        watchedCategories.sort().join(",") !==
          project.categories
            .map((c) => c.id)
            .sort()
            .join(","))) ||
    (allowEditImages && (newImages.length > 0 || removedImageUrls.length > 0));

  const handleSave = async (): Promise<void> => {
    if (allowEditImages && removedImageUrls.length > 0) {
      for (const imageUrl of removedImageUrls) {
        const deleteRes = await fetch("/api/delete-project-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            imageUrl: imageUrl,
          }),
        });

        if (!deleteRes.ok) {
          console.error(`Failed to delete image ${imageUrl}: ${deleteRes.statusText}`);
        }
      }
    }

    const uploadedUrls: string[] = [];
    if (allowEditImages && newImages.length > 0) {
      for (const file of newImages.slice(0, 10)) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);
        uploadFormData.append("projectId", project.id);

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: uploadFormData,
        });

        if (res.ok) {
          const data: UploadedImageResponse = await res.json();
          uploadedUrls.push(data.url);
        }
      }
    }

    const payload: PatchPayload = {};

    if (isAuthor || isAdmin) {
      payload.title = titleInput;
      payload.description = descriptionInput;
    }

    if (allowEditProgressNotes && progressNotes !== (project.progressNotes || "")) {
      payload.progressNotes = progressNotes;
    }

    if (allowEditProgress && progress !== (project.progress ?? 0)) {
      payload.progress = progress;
    }

    if (allowEditStatus && (status !== project.status || statusChanged)) {
      payload.status = status;
    }

    if (
      allowEditCategories &&
      (categoriesChanged ||
        watchedCategories.sort().join(",") !==
          project.categories
            .map((c) => c.id)
            .sort()
            .join(","))
    ) {
      payload.categories = watchedCategories;
    }

    if (allowEditImages && uploadedUrls.length > 0) {
      payload.newImageUrls = uploadedUrls;
    }

    if (allowEditImages && removedImageUrls.length > 0) {
      payload.removeImageUrls = removedImageUrls;
    }

    if (Object.keys(payload).length > 0) {
      const patchRes = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!patchRes.ok) throw new Error("Failed to update project");

      refreshProjects();
      onClose();
      setTitleChanged(false);
      setDescriptionChanged(false);
      setNewImages([]);
      setRemovedImageUrls([]);
      setEditCategories(false);
      setStatusChanged(false);
      setCategoriesChanged(false);
    }
  };

  const handleLike = async () => {
    setAnimationKey(Date.now());
    if (!user.id || isLiking) return;
    setIsLiking(true);

    try {
      socket?.emit("project:like", { projectId: project.id, userId: user.id });
      const alreadyLiked = likes.some((like) => like.userId === user.id);
      let newLikes;
      if (alreadyLiked) {
        newLikes = likes.filter((like) => like.userId !== user.id);
      } else {
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

      const res = await fetch(`/api/projects/${project.id}/like`, {
        method: "POST",
      });
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("FILES FROM INPUT:", files);

    if (!files || files.length === 0) return;

    try {
      const maxImages = 10;
      const currentTotal = existingImages.length + newImages.length;
      const slotsAvailable = maxImages - currentTotal;

      if (slotsAvailable <= 0) {
        alert(`Maximum of ${maxImages} images reached (${currentTotal} already added).`);
        e.target.value = "";
        return;
      }

      const filesArray = Array.from(files);
      const filesToAdd = filesArray.length > slotsAvailable ? filesArray.slice(0, slotsAvailable) : filesArray;

      if (filesArray.length > slotsAvailable) {
        alert(`Only adding ${slotsAvailable} of ${filesArray.length} images to stay within the limit of ${maxImages}.`);
      }

      setNewImages((current) => [...current, ...filesToAdd]);
    } catch (err) {
      console.error("Error handling files:", err);
    }

    e.target.value = "";
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "PROPOSED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
    setStatus(newStatus);
    setStatusChanged(newStatus !== project.status);
  };

  const handleClose = async () => {
    if (anyFieldChanged) {
      const result = await confirm({
        title: "Unsaved Changes",
        description: "You have unsaved changes. Are you sure you want to close? All unsaved data will be lost.",
        confirmText: "Discard Changes",
        cancelText: "Cancel",
      });
      if (result) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleDeleteImage = async (img: ProjectImage, idx?: number, isNew?: boolean) => {
    if (!allowEditImages) return;

    const result = await confirm({
      title: "Delete Image",
      description: "Are you sure you want to delete this image?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!result) return;
    if (isNew && typeof idx === "number") {
      setNewImages((imgs) => imgs.filter((_, i) => i !== idx));
    } else if (img.url) {
      setRemovedImageUrls((urls) => [...urls, img.url]);
    }
  };

  const handleProjectDelete = async () => {
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
        className={cn("relative max-h-[90vh] max-w-2xl overflow-y-auto p-6", {
          "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
          "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
        })}
      >
        {/* DELETE BUTTON: top left */}
        {(isAuthor || isAdmin) && (
            <>
              <div className="absolute left-2 top-2 flex items-center">
                <TooltipWithIcon
                  id="edit-title"
                  icon={Trash}
                  content="Delete Project"
                  theme={theme}
                  iconClassName="text-red-700 hover:text-red-900"
                  onClick={() => setShowDeleteSection(true)}
                />
              </div>
            </>
          )}

        {/* TITLE */}
        <div className="mb-2 mt-2 flex items-center gap-2">
          <label className="text-sm font-medium">Project Title:</label>
          {editingTitle ? (
            <>
              <input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="rounded border px-2 py-1 text-xl font-bold"
                autoFocus
              />
              <button
                onClick={() => {
                  setEditingTitle(false);
                  setTitleInput(project.title);
                }}
              >
                <X className="h-6 w-6 text-red-600 hover:text-red-700" />
              </button>
              {titleInput !== project.title && (
                <button
                  onClick={() => {
                    setEditingTitle(false);
                    setTitleChanged(true);
                  }}
                >
                  <Check className="h-6 w-6 text-green-600 hover:text-green-700" />
                </button>
              )}
            </>
          ) : (
            <>
              <span className="text-xl font-bold">{titleInput}</span>
              {((isAuthor && isEditable) || isAdmin) && (
        <TooltipWithIcon
          id="edit-title"
          icon={Pencil}
          content="Edit Title"
          theme={theme}
          tooltipPlacement="top"
          iconClassName="text-blue-500 h-4 w-4"
          onClick={() => setEditingTitle(true)}
        />
      )}
    </>
          )}
        </div>

        {/* POSTCODE */}
        <div className="mb-2">
          <span className="text-sm">
            <b>Postcode:</b> {project.postcode}
          </span>
        </div>

        {/* CATEGORIES */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Categories:</span>
            {!editCategories &&
              displayCategories.map(({ id, name }) => {
                const matched = PROJECT_CATEGORIES.find((cat) => cat.id === id);
                const Icon = matched?.icon;
                return (
                  Icon && (
                    <TooltipWithIcon
                      key={id}
                      id={id}
                      icon={Icon}
                      content={name}
                      theme={theme}
                      iconClassName="h-5 w-5"
                    />
                  )
                );
              })}
            {allowEditCategories && !editCategories && (
              <>
                <TooltipWithIcon
                  id="edit-title"
                  icon={Pencil}
                  content="Edit Categories"
                  theme={theme}
                  tooltipPlacement="top"
                  iconClassName="text-blue-500 h-4 w-4"
                  onClick={() => setEditCategories(true)}
                />
              </>
            )}
          </div>
          {/* Categories edit mode */}
          {allowEditCategories && editCategories && (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold">Categories</label>
                <span className="text-xs text-gray-500">Select up to 3</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {PROJECT_CATEGORIES.map((cat) => {
                  const isDisabled = watchedCategories.length >= 3 && !watchedCategories.includes(cat.id);
                  return (
                    <div key={cat.id} className={cn("relative", { group: isDisabled })}>
                      <label
                        className={cn("flex items-center gap-2 text-sm transition-opacity", {
                          "cursor-pointer": !isDisabled,
                          "cursor-not-allowed opacity-50": isDisabled,
                        })}
                      >
                        <Controller
                          control={control}
                          name="categories"
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              value={cat.id}
                              checked={field.value?.includes(cat.id)}
                              disabled={isDisabled}
                              className={cn({
                                "cursor-pointer": !isDisabled,
                                "cursor-not-allowed": isDisabled,
                              })}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if ((field.value || []).length < 3) {
                                    const newCategories = [...(field.value || []), cat.id];
                                    field.onChange(newCategories);
                                  }
                                } else {
                                  const newCategories = (field.value || []).filter((id: string) => id !== cat.id);
                                  field.onChange(newCategories);
                                }
                              }}
                            />
                          )}
                        />
                        <div className={cn("flex items-center", { "cursor-not-allowed": isDisabled })}>
                          {cat.icon && <cat.icon className={cn("h-5 w-5", { "text-gray-400": isDisabled })} />}
                          <span>{cat.name}</span>
                        </div>
                      </label>

                      {/* Custom tooltip for disabled state */}
                      {isDisabled && (
                        <TooltipBubble theme={theme} content="Max. 3 allowed" placement="top" className="z-50" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                {/* Only show the save button if categories have changed */}
                {watchedCategories.sort().join(",") !==
                  project.categories
                    .map((c) => c.id)
                    .sort()
                    .join(",") && (
                  <div className="group relative">
                    <button
                      onClick={applyCategories}
                      className="rounded-full p-1 transition-colors"
                    >
                      <Check className="h-6 w-6 text-green-600 hover:text-green-700" />
                    </button>
                    <TooltipBubble theme={theme} content="Save" placement="top" />
                  </div>
                )}

                {/* Always show the cancel button */}
                <div className="group relative">
                  <button
                    onClick={cancelCategoryEdit}
                    className="rounded-full p-1 transition-colors"
                  >
                    <X className="h-6 w-6 text-red-600 hover:text-red-700" />
                  </button>
                  <TooltipBubble theme={theme} content="Cancel" placement="top" />
                </div>
              </div>
            </div>
          )}
        </div>
         {/* Status Icon with Tooltip */}
         <div className="mb-4 flex items-center gap-2">
  <span className="text-sm font-semibold">Status:</span>
  
  {/* Status Icon with Tooltip */}
  <div className="group relative flex items-center">
    <Image
      src={`/images/${
        status === "COMPLETED" 
          ? "project-completed.png" 
          : status === "IN_PROGRESS" 
          ? "project-in-progress.png" 
          : status === "REJECTED"
          ? "marker-icon.png"
          : "project-proposed.png"
      }`}
      alt={status}
      width={20}
      height={20}
      className="h-8 w-8 object-contain"
    />
    <TooltipBubble
      theme={theme}
      content={status.replace("_", " ")}
      placement="top"
    />
  </div>
  
  
  {/* Edit Status Button */}
  {allowEditStatus && !editingStatus && (
    <TooltipWithIcon
      id="edit-status"
      icon={Pencil}
      content="Edit Status"
      theme={theme}
      tooltipPlacement="top"
      iconClassName="text-blue-500 h-4 w-4"
      onClick={() => setEditingStatus(true)}
    />
  )}
</div>

{/* Status Edit Dropdown - only shown when editing */}
{allowEditStatus && editingStatus && (
  <div className="mb-4 flex items-center gap-2">
    <label className="text-sm font-semibold">New Status:</label>
    <select 
      value={status} 
      onChange={handleStatusChange} 
      className="rounded border px-2 py-1"
    >
      <option value="PROPOSED">Proposed</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="COMPLETED">Completed</option>
      <option value="REJECTED">Rejected</option>
    </select>
    
    {/* Confirm/Cancel buttons */}
    <div className="flex gap-1">
      <button
        onClick={() => {
          setEditingStatus(false);
          setStatus(project.status);
          setStatusChanged(false);
        }}
        aria-label="Cancel"
      >
        <X className="h-6 w-6 text-red-600 hover:text-red-700" />
      </button>
      {status !== project.status && (
        <button
          onClick={() => {
            setEditingStatus(false);
            setStatusChanged(true);
          }}
          aria-label="Confirm"
        >
          <Check className="h-6 w-6 text-green-600 hover:text-green-700" />
        </button>
      )}
    </div>
  </div>
)}

        {/* IMAGES CAROUSEL & UPLOAD & EDIT */}
        <div className="relative mb-4 flex flex-col items-center">
          <div className="flex w-full items-center justify-center gap-2">
            {imagesCount > visibleImages && (
              <button
                onClick={handlePrev}
                className="rounded-full bg-gray-200 p-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <div className="flex gap-2">
              {displayedImages.map((img, idx) => (
                <div key={img.id || idx} className="group relative">
                  <Image
                    src={img.url}
                    alt="Project Image"
                    width={150}
                    height={110}
                    className="cursor-pointer rounded border border-gray-300 object-cover shadow"
                    style={{ minWidth: 150, minHeight: 110, maxHeight: 110, maxWidth: 150 }}
                    onClick={() => !editImages && setZoomedImage(img)}
                  />
                  {editImages && (
                    <button
                      type="button"
                      className="absolute right-1 top-1 z-10 rounded-full bg-white/80 p-1 hover:bg-red-500 hover:text-white"
                      onClick={() => handleDeleteImage(img, idx, false)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {imagesCount > visibleImages && (
              <button
                onClick={handleNext}
                className="rounded-full bg-gray-200 p-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
          {/* Preview for NEW images BEFORE SAVE */}
          {newImages.length > 0 && (
            <div className="mt-4 flex w-full flex-wrap justify-center gap-2">
              {newImages.map((file, idx) => {
                const previewUrl = newImagePreviews[idx];
                if (!previewUrl) return null;
                return (
                  <div key={idx} className="group relative">
                    <Image
                      src={previewUrl}
                      width={96}
                      height={64}
                      className="h-16 w-24 cursor-pointer rounded border object-cover"
                      alt="preview"
                      onClick={() => !editImages && setZoomedImage({ url: previewUrl })}
                    />
                    {editImages && (
                      <button
                        type="button"
                        className="absolute right-1 top-1 z-10 rounded-full bg-white/80 p-1 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDeleteImage({ id: `new-${idx}`, url: previewUrl }, idx, true)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* Edit Images Button */}
          {allowEditImages && !editImages && (
            <button
              className="mt-3 flex items-center gap-2 rounded bg-gray-200 px-3 py-1 text-blue-600 hover:bg-gray-300"
              onClick={() => setEditImages(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit Images
            </button>
          )}
          {/* Upload + Done Editing */}
          {editImages && (
            <div className="mt-3 flex w-full flex-col items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
              >
                <Upload className="h-5 w-5" /> Add Images
              </button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <button className="mt-2 text-xs text-gray-600 underline" onClick={() => setEditImages(false)}>
                Done Editing Images
              </button>
            </div>
          )}
        </div>

        {/* Zoomed Image Modal */}
        {zoomedImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80">
            <button
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white"
              onClick={() => setZoomedImage(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <Image
              src={zoomedImage.url}
              alt=""
              width={900}
              height={600}
              className="max-h-[90vh] max-w-[95vw] rounded object-contain shadow-lg"
            />
          </div>
        )}

        {/* PROGRESS BAR */}
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
        </div>

        {/* DESCRIPTION */}
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <label className="mb-1 text-sm font-medium">Description:</label>
            {editingDescription && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingDescription(false);
                    setDescriptionInput(project.description);
                  }}
                  aria-label="Cancel"
                >
                  <X className="h-6 w-6 text-red-600 hover:text-red-700" />
                </button>
                {descriptionInput !== project.description && (
                  <button
                    onClick={() => {
                      setEditingDescription(false);
                      setDescriptionChanged(true);
                    }}
                    aria-label="Confirm"
                  >
                    <Check className="h-6 w-6 text-green-600 hover:text-green-700" />
                  </button>
                )}
              </div>
            )}
            {!editingDescription && isAuthor && isEditable && (
              <TooltipWithIcon
                id="edit-description"
                icon={Pencil}
                content="Edit Description"
                theme={theme}
                iconClassName="text-blue-500 h-4 w-4"
                onClick={() => setEditingDescription(true)}
              />
            )}
          </div>
          {editingDescription ? (
            <textarea
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              className="mt-1 w-full resize-none rounded border px-2 py-2 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
              rows={8}
              style={{ minHeight: "120px" }}
              autoFocus
            />
          ) : (
            <div
              className={cn(
                "mt-1 min-h-[120px] w-full rounded border bg-gray-50 px-2 py-2 transition-all",
                "text-sm",
                "border-gray-300",
                "dark:border-gray-600 dark:bg-[#282625]",
              )}
              style={{ whiteSpace: "pre-line" }}
            >
              {descriptionInput || <span className="text-gray-400">No description yet...</span>}
            </div>
          )}
        </div>

        {/* PROGRESS NOTES */}
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

        {/* LIKE/COMMENT BUTTONS */}
        <div className="mt-8 flex justify-between gap-2">
          <div className="relative flex flex-col items-center">
            <span className="mb-1 text-sm">({likes.length}) Likes</span>
            <div className="relative inline-flex overflow-hidden rounded-full p-[4px]">
              {likes.some((like) => like.userId === user.id) ? (
                <GlowingPinkButton onClick={handleLike} className="w-32" disabled={isLiking}>
                  Liked
                </GlowingPinkButton>
              ) : (
                <GlowingGreenButton onClick={handleLike} className="w-32" disabled={isLiking}>
                  Like
                </GlowingGreenButton>
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
            <GlowingVioletButton onClick={() => setShowCommentModal(true)} className="w-32">
              Comment
            </GlowingVioletButton>
          </div>
        </div>

        {/* DELETE PROJECT SECTION */}
        {(isAuthor || isAdmin) && showDeleteSection && (
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

        {/* SAVE / CANCEL BUTTONS */}
        {(isAuthor || user.roleId === "admin") && anyFieldChanged && (
          <div className="mt-6 flex justify-end gap-3">
            <GlowingPinkButton onClick={handleClose} className="text-sm">
              Cancel
            </GlowingPinkButton>
            <GlowingGreenButton onClick={handleSave} className="text-sm">
              Save
            </GlowingGreenButton>
          </div>
        )}

        {/* COMMENT/ALL COMMENTS MODALS */}
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
