"use client";

import { useProjectContext } from "@/context/project-context";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { useProjectEdit } from "@/hooks/use-Project-Edit.hook";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { AuthUser } from "@/models/auth";
import { Project } from "@/models/project";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { saveProjectChanges } from "@/utils/project-edit";
import { useState } from "react";
import ActionButtonsCancelSave from "./action-buttons-cancel-save";
import CommentCreation from "./create-comment";
import ModalOverlay from "./modal-overlay";
import ProjectAllComments from "./project-all-comments";
import CategorySelector from "./project-category-selector";
import ProjectDelete from "./project-delete-element";
import ProjectDescription from "./project-description";
import ProjectHeader from "./project-details-header";
import ProjectImageUpload from "./project-image-upload";
import ProjectProgress from "./project-progress";
import ProjectProgressNotes from "./project-progress-notes";
import ProjectSocial from "./project-social-area";
import ProjectStatus from "./project-status";

interface ProjectDetailsDialogProps {
  user: AuthUser;
  project: Project;
  open: boolean;
  onClose: () => void;
  theme: string;
}

const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({ user, project, open, onClose, theme }) => {
  const isAuthor = user.id === project.author.id;
  const isAdmin = user.roleId === "admin";
  const isEditable = project.status === "PROPOSED";

  const { refreshProjects } = useProjectContext();
  const { confirm } = useConfirmation();

  const {
    allowEditProgressNotes,
    allowEditProgress,
    allowEditStatus,
    allowEditCategories,
    allowEditImages,

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

    editingTitle,
    setEditingTitle,
    titleChanged,
    setTitleChanged,
    setDescriptionChanged,
    editingStatus,
    setEditingStatus,

    setStatusChanged,
    setCategoriesChanged,
    editingProgress,
    setEditingProgress,
    setProgressChanged,

    existingImages,
    newImages,
    setNewImages,
    removedImageUrls,
    setRemovedImageUrls,

    anyFieldChanged,
    resetEditStates,

    resetCategoriesToOriginal,
    resetDescriptionToOriginal,
    resetStatusToOriginal,
    resetProgressToOriginal,
    resetProgressNotesToOriginal,
    resetTitleToOriginal,
  } = useProjectEdit(project, { id: user.id, roleId: user.roleId ?? "" });

  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

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

  const handleSave = async () => {
    try {
      const latestCategories = control._formValues.categories || [];

      await saveProjectChanges({
        project,
        isAuthor,
        isAdmin,
        titleInput,
        descriptionInput,
        progressNotes,
        progress,
        status,
        watchedCategories: latestCategories,
        newImages,
        removedImageUrls,
      });

      refreshProjects();
      onClose();
      resetEditStates();
    } catch (error) {
      console.error("Failed to save project changes:", error);
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

        {(isAuthor || isAdmin) && (
          <ProjectDelete
            showDeleteSection={showDeleteSection}
            setShowDeleteSection={setShowDeleteSection}
            theme={theme}
            projectId={project.id}
            refreshProjects={refreshProjects}
          />
        )}

        <ProjectHeader
          project={project}
          titleInput={titleInput}
          setTitleInput={setTitleInput}
          editingTitle={editingTitle}
          setEditingTitle={setEditingTitle}
          isEditable={(isAuthor && isEditable) || isAdmin}
          theme={theme}
          titleChanged={titleChanged}
          setTitleChanged={setTitleChanged}
          onCancel={resetTitleToOriginal}
        />

        <CategorySelector
          mode="edit"
          theme={theme}
          control={control}
          watchedCategories={watchedCategories}
          displayCategories={displayCategories}
          allowEdit={allowEditCategories}
          // Update parent state immediately on checkbox changes
          onCategoriesChange={(categories) => {
            console.log("Categories changed:", categories);
            setCategoriesChanged(true);
          }}
          onEditComplete={(categories) => {
            console.log("Categories edit complete:", categories);
            setCategoriesChanged(true);
            setDisplayCategories(
              categories.map((id) => {
                const cat = PROJECT_CATEGORIES.find((c) => c.id === id);
                return { id, name: cat?.name || "" };
              }),
            );
          }}
          onCancel={resetCategoriesToOriginal}
        />

        <ProjectStatus
          project={project}
          status={status}
          setStatus={setStatus}
          editingStatus={editingStatus}
          setEditingStatus={setEditingStatus}
          theme={theme}
          setStatusChanged={setStatusChanged}
          allowEditStatus={allowEditStatus}
          onCancel={resetStatusToOriginal}
        />

        <ProjectImageUpload
          mode="edit"
          theme={theme}
          existingImages={existingImages}
          onImagesChange={setNewImages}
          onRemoveImage={(url) => setRemovedImageUrls((prev) => [...prev, url])}
          allowEdit={allowEditImages}
          // onCancel={resetImagesToOriginal}
        />

        <ProjectProgress
          project={project}
          progress={progress}
          setProgress={setProgress}
          editingProgress={editingProgress}
          setEditingProgress={setEditingProgress}
          theme={theme}
          setProgressChanged={setProgressChanged}
          allowEditProgress={allowEditProgress}
          onCancel={resetProgressToOriginal}
        />

        <ProjectDescription
          project={project}
          descriptionInput={descriptionInput}
          setDescriptionInput={setDescriptionInput}
          isAuthor={isAuthor}
          isAdmin={isAdmin}
          isEditable={isEditable}
          theme={theme}
          setDescriptionChanged={setDescriptionChanged}
          onCancel={resetDescriptionToOriginal}
        />

        <ProjectProgressNotes
          project={project}
          progressNotes={progressNotes}
          setProgressNotes={setProgressNotes}
          allowEditProgressNotes={allowEditProgressNotes}
          onCancel={resetProgressNotesToOriginal}
        />

        <ProjectSocial
          project={project}
          user={user}
          theme={theme}
          setShowCommentModal={setShowCommentModal}
          setShowAllComments={setShowAllComments}
        />

        {(isAuthor || isAdmin) && anyFieldChanged && (
          <ActionButtonsCancelSave onCancel={handleClose} onSave={handleSave} />
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
