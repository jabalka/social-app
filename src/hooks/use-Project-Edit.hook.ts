import {
  canEditCategories,
  canEditImages,
  canEditProgress,
  canEditProgressNotes,
  canEditStatus,
} from "@/lib/role-permissions";
import { Project } from "@/models/project.types";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

export const useProjectEdit = (project: Project, user: { id: string; roleId: string }) => {
  const originalTitle = project.title;
  const originalDescription = project.description;
  const originalProgressNotes = project.progressNotes || "";
  const originalProgress = project.progress ?? 0;
  const originalStatus = project.status;
  const originalCategories = project.categories.map((cat) => cat.id);

  const allowEditProgressNotes = canEditProgressNotes(user.roleId);
  const allowEditProgress = canEditProgress(user.roleId);
  const allowEditStatus = canEditStatus(user.roleId);
  const allowEditCategories = canEditCategories(user.roleId);
  const isAuthor = user.id === project.author.id;
  const allowEditImages =
    canEditImages(user.roleId) || (isAuthor && (project.status === "PROPOSED" || project.status === "IN_PROGRESS"));

  const [titleInput, setTitleInput] = useState(originalTitle);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleChanged, setTitleChanged] = useState(false);

  const [descriptionInput, setDescriptionInput] = useState(originalDescription);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionChanged, setDescriptionChanged] = useState(false);

  const [displayCategories, setDisplayCategories] = useState<{ id: string; name: string }[]>(project.categories);
  const [progressNotes, setProgressNotes] = useState(originalProgressNotes);
  const [progress, setProgress] = useState(originalProgress);
  const [status, setStatus] = useState(originalStatus);

  const [editingProgress, setEditingProgress] = useState(false);
  const [progressChanged, setProgressChanged] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editCategories, setEditCategories] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  const [categoriesChanged, setCategoriesChanged] = useState(false);

  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);

  const { control, reset } = useForm({
    defaultValues: { categories: originalCategories },
  });

  const watchedCategories = useWatch({
    control,
    name: "categories",
    defaultValue: originalCategories,
  });

  const resetTitleToOriginal = () => {
    setTitleInput(originalTitle);
    setTitleChanged(false);
  };

  const resetDescriptionToOriginal = () => {
    setDescriptionInput(originalDescription);
    setDescriptionChanged(false);
  };

  const resetProgressToOriginal = () => {
    setProgress(originalProgress);
    setProgressChanged(false);
  };

  const resetProgressNotesToOriginal = () => {
    setProgressNotes(originalProgressNotes);
  };

  const resetStatusToOriginal = () => {
    setStatus(originalStatus);
    setStatusChanged(false);
  };

  const resetCategoriesToOriginal = () => {
    reset({ categories: originalCategories });
    setDisplayCategories(project.categories);
    setCategoriesChanged(false);
  };

  const existingImages = (project.images || [])
    .filter((img) => !removedImageUrls.includes(img.url))
    .map((img) => ({ id: img.id, url: img.url }));

  const anyFieldChanged = useMemo(() => {
    
    const canEditTitleAndDescription = isAuthor || user.roleId === "admin";
    
    // const hasImageChanges = newImages.length > 0 || removedImageUrls.length > 0;
    // console.log("Change detection debug:", {
    //   titleChanged,
    //   descriptionChanged,
    //   progressChanged,
    //   statusChanged,
    //   categoriesChanged,
    //   newImages: newImages.length,
    //   removedImages: removedImageUrls.length,
    //   hasImageChanges,
    //   isAllowedToEditImages: allowEditImages
    // });

    return (
      (canEditTitleAndDescription && titleChanged) ||
      (canEditTitleAndDescription && descriptionChanged) ||
      (allowEditProgressNotes && progressNotes !== originalProgressNotes) ||
      (allowEditProgress && (progress !== originalProgress || progressChanged)) ||
      (allowEditStatus && (status !== originalStatus || statusChanged)) ||
      (allowEditCategories &&
        (categoriesChanged || watchedCategories.sort().join(",") !== originalCategories.sort().join(","))) ||
      (allowEditImages && (newImages.length > 0 || removedImageUrls.length > 0))
    );
  }, [
    user.roleId,
    titleChanged,
    descriptionChanged,
    progressNotes,
    progress,
    progressChanged,
    status,
    statusChanged,
    categoriesChanged,
    watchedCategories,
    newImages,
    removedImageUrls,
    isAuthor,
    allowEditProgressNotes,
    allowEditProgress,
    allowEditStatus,
    allowEditCategories,
    allowEditImages,
    originalProgressNotes,
    originalProgress,
    originalStatus,
    originalCategories,
  ]);

  const resetEditStates = () => {
    setTitleChanged(false);
    setDescriptionChanged(false);
    setNewImages([]);
    setRemovedImageUrls([]);
    setEditCategories(false);
    setStatusChanged(false);
    setCategoriesChanged(false);
    setProgressChanged(false);
  };

  const resetAllToOriginal = () => {
    resetTitleToOriginal();
    resetDescriptionToOriginal();
    resetProgressToOriginal();
    resetProgressNotesToOriginal();
    resetStatusToOriginal();
    resetCategoriesToOriginal();
    setNewImages([]);
    setRemovedImageUrls([]);
    resetEditStates();
  };

  return {
    // Permission flags
    allowEditProgressNotes,
    allowEditProgress,
    allowEditStatus,
    allowEditCategories,
    allowEditImages,

    // Form state
    titleInput,
    setTitleInput,
    descriptionInput,
    setDescriptionInput,
    displayCategories,
    setDisplayCategories,
    progressNotes,
    setProgressNotes,
    progress,
    setProgress,
    status,
    setStatus,
    watchedCategories,
    control,

    // Edit state flags
    editingTitle,
    setEditingTitle,
    titleChanged,
    setTitleChanged,
    editingDescription,
    setEditingDescription,
    descriptionChanged,
    setDescriptionChanged,
    editCategories,
    setEditCategories,
    editingStatus,
    setEditingStatus,
    statusChanged,
    setStatusChanged,
    categoriesChanged,
    setCategoriesChanged,
    editingProgress,
    setEditingProgress,
    progressChanged,
    setProgressChanged,

    // Image management
    existingImages,
    newImages,
    setNewImages,
    removedImageUrls,
    setRemovedImageUrls,

    // Reset functions
    resetTitleToOriginal,
    resetDescriptionToOriginal,
    resetProgressToOriginal,
    resetProgressNotesToOriginal,
    resetStatusToOriginal,
    resetCategoriesToOriginal,
    resetAllToOriginal,

    // Helper methods
    anyFieldChanged,
    resetEditStates,
  };
};
