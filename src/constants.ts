import { Theme } from "./types/theme.enum";

// Time constants
export const SWIPER_ANIMATION_DURATION_MS = 300;
export const TOASTER_DURATION_MS = 3000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const MONTH_MS = 30 * DAY_MS;
export const SIX_MONTHS_MS = 6 * MONTH_MS;
export const TWELVE_MONTHS_MS = 12 * MONTH_MS;
export const EIGHTEEN_MONTHS_MS = 18 * MONTH_MS;
export const TWO_DAYS_MS = 2 * DAY_MS;
export const FOURTEEN_DAYS_MS = 14 * DAY_MS;

// UI related constants
export const DEFAULT_THEME = Theme.DARK;
export const DEFAULT_SIDEBAR_EXPANDED = true;

// Profile Related constants
export const MAX_NAME_LENGTH = 18;
export const MAX_USERNAME_LENGTH = 15;

// Project Categories
// export const PROJECT_CATEGORIES = [
//   { id: "infrastructure", name: "Infrastructure", icon: "building" },
//   { id: "environmental", name: "Environmental", icon: "leaf" },
//   { id: "education", name: "Education", icon: "graduation-cap" },
//   { id: "public-safety", name: "Public Safety", icon: "shield-check" },
//   { id: "transport", name: "Transport", icon: "bus" },
// ];

// User Role Permissions
export const ALLOWED_ROLES_FOR_PROGRESS_NOTES = ["admin", "council", "mayor", "planner", "inspector"];
export const ALLOWED_ROLES_FOR_PROGRESS = ["admin", "council", "mayor", "inspector"];
export const ALLOWED_ROLES_FOR_PROJECT_STATUS = ["admin", "council", "mayor"];
export const ALLOWED_ROLES_FOR_PROJECT_CATEGORIES = ["admin", "council", "mayor", "planner", "inspector"];
export const ALLOWED_ROLES_FOR_IMAGE = ["admin", "planner", "inspector"];

// Messages
export const MESSAGES = {
  // Authentication
  USER_NOT_FOUND: "We were unable to find your account",
  USER_ALREADY_EXISTS: "User already exists",
  REGISTRATION_SUCCESSFUL: "Registration successful, please check your inbox for a verification link",
  NO_HASHED_PASSWORD: "Your account has no password associated with it, perhaps you signed in with Google?",
  EMAIL_NOT_VERIFIED: "Please verify your email before logging in",
  INVALID_CREDENTIALS: "Invalid credentials",
  MISSING_VERIFICATION_TOKEN: "Missing verification token",
  INVALID_VERIFICATION_TOKEN: "Invalid verification token",
  VERIFICATION_SUCCESSFUL: "Email verified successfully",
  PASSWORDS_MISMATCH: "Passwords don't match",
  NEW_PASSWORDS_MISMATCH: "New passwords don't match",

  // Communicating with users
  MESSAGE_SENT_SUCCESSFULLY: (email: string) => `Message sent successfully to ${email}`,

  // General
  SOMETHING_WENT_WRONG: "Something went wrong, please try again later",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions to perform this action",

  //Toast
  IDEA_DRAFT_SAVED: "Idea saved as draft. You can resume later.",
  IDEA_CREATE_ERROR: "An error occurred while creating your idea.",
  IDEA_CREATE_SUCCESS : "Your idea has been successfully created!",

  PROJECT_DRAFT_SAVED: "Project saved as draft. You can resume later.",
  PROJECT_CREATE_ERROR: "An error occurred while creating your project.",
  PROJECT_CREATE_SUCCESS : "Your project has been successfully created!",

  ISSUE_REPORT_DRAFT_SAVED: "Your issue report draft has been saved",
  ISSUE_REPORT_CREATE_ERROR: "An error occurred while creating your report.",
  ISSUE_REPORT_SUCCESS : "Your issue report has been successfully created!",
}

export const Z_INDEX = {
  BASE: 1,
  DROPDOWN: 10,
  STICKY: 20,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  LOADER: 100,
  TOOLTIP: 1000,
};


export const radiusOptions = [
  { label: "5 miles", value: 5 * 1609 },         // 8045 meters
  { label: "10–25 miles", value: 25 * 1609 },          // 40225 meters
  { label: "50 miles", value: 50 * 1609 },       // 80450 meters
  { label: "+50 miles", value: 100 * 1609 },       // 160900 meters
];

