import {
  ALLOWED_ROLES_FOR_PROGRESS,
  ALLOWED_ROLES_FOR_PROGRESS_NOTES,
  ALLOWED_ROLES_FOR_PROJECT_CATEGORIES,
  ALLOWED_ROLES_FOR_PROJECT_STATUS,
  ALLOWED_ROLES_FOR_IMAGE
} from "@/constants";

const ROLES = {
  PROGRESS: ALLOWED_ROLES_FOR_PROGRESS,
  PROGRESS_NOTES: ALLOWED_ROLES_FOR_PROGRESS_NOTES,
  PROJECT_CATEGORIES: ALLOWED_ROLES_FOR_PROJECT_CATEGORIES,
  PROJECT_STATUS: ALLOWED_ROLES_FOR_PROJECT_STATUS,
  IMAGE: ALLOWED_ROLES_FOR_IMAGE
};

export type RoleName = keyof typeof ROLES;

export const canEditProgressNotes = (roleId: string | null | undefined) =>
  !!roleId && ALLOWED_ROLES_FOR_PROGRESS_NOTES.includes(roleId);

export const canEditProgress = (roleId: string | null | undefined) =>
  !!roleId && ALLOWED_ROLES_FOR_PROGRESS.includes(roleId);

export const canEditStatus = (roleId: string | null | undefined) =>
  !!roleId && ALLOWED_ROLES_FOR_PROJECT_STATUS.includes(roleId);

export const canEditCategories = (roleId: string | null | undefined) =>
  !!roleId && ALLOWED_ROLES_FOR_PROJECT_CATEGORIES.includes(roleId);

export const canEditImages = (roleId: string | null | undefined) =>
  !!roleId && ALLOWED_ROLES_FOR_IMAGE.includes(roleId);

export function hasPermission(userRole: string | null | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

// Check if a role has at least the required level
export function hasRoleLevel(userRole: string | null | undefined, minimumRole: RoleName): boolean {
  if (!userRole) return false;
  const userLevel = ROLES[userRole as RoleName] || 0;
  const requiredLevel = ROLES[minimumRole];
  return userLevel >= requiredLevel;
}