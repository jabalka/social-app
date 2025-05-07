import {
  ALLOWED_ROLES_FOR_PROGRESS,
  ALLOWED_ROLES_FOR_PROGRESS_NOTES,
  ALLOWED_ROLES_FOR_PROJECT_CATEGORIES,
  ALLOWED_ROLES_FOR_PROJECT_STATUS,
} from "@/constants";

export const canEditProgressNotes = (roleId: string | null | undefined) =>
  !!roleId && ALLOWED_ROLES_FOR_PROGRESS_NOTES.includes(roleId);

export const canEditProgress = (roleId: string | null | undefined) =>
  !!roleId && ALLOWED_ROLES_FOR_PROGRESS.includes(roleId);

export const canEditStatus = (roleId: string | null | undefined) =>
  !!roleId && ALLOWED_ROLES_FOR_PROJECT_STATUS.includes(roleId);

export const canEditCategories = (roleId: string | null | undefined) =>
  !!roleId && ALLOWED_ROLES_FOR_PROJECT_CATEGORIES.includes(roleId);
