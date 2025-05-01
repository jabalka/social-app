import { Theme } from "./types/theme.enum";

// Time constants
export const SWIPER_ANIMATION_DURATION_MS = 300;
export const TOASTER_DURATION_MS = 6000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const MONTH_MS = 30 * DAY_MS;
export const SIX_MONTHS_MS = 6 * MONTH_MS;
export const TWELVE_MONTHS_MS = 12 * MONTH_MS;
export const EIGHTEEN_MONTHS_MS = 18 * MONTH_MS;
export const TWO_DAYS_MS = 2 * DAY_MS;
export const FOURTEEN_DAYS_MS = 14 * DAY_MS;

// Blockchain related constants

export const USER_REFERRAL_STAKING_BONUS_PERCENTAGE = 3;
export const ADMIN_REFERRAL_STAKING_BONUS_PERCENTAGE = 5;
export const AFFILIATE_REFERRAL_STAKING_BONUS_PERCENTAGE = 5;
export const AMBASSADOR_REFERRAL_STAKING_BONUS_PERCENTAGE = 5;
export const PARTNER_REFERRAL_STAKING_BONUS_PERCENTAGE = 5;

// UI related constants
export const DEFAULT_THEME = Theme.DARK;
export const DEFAULT_SIDEBAR_EXPANDED = true;

// Project Categories
export const PROJECT_CATEGORIES = [
  { id: "infrastructure", name: "Infrastructure", icon: "building" },
  { id: "environmental", name: "Environmental", icon: "leaf" },
  { id: "education", name: "Education", icon: "graduation-cap" },
  { id: "public-safety", name: "Public Safety", icon: "shield-check" },
  { id: "transport", name: "Transport", icon: "bus" },
];



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

  // Multi-Factor Authentication
  MFA_REQUIRED_TO_WITHDRAW: "You must enable MFA in order to withdraw",
  MFA_MISSING_TOKEN: "Missing MFA 6-digit authenticator code",
  MFA_INVALID_TOKEN: "Invalid 6-digit code",
  MFA_ENABLED_SUCCESSFULLY: "MFA set up successfully",
  MFA_INVALID_BACKUP_CODES: "Invalid backup codes",
  MFA_RESET_SUCCESSFUL: "MFA has been reset successfully, you can now set it up again",

  // Staking and Tokens
  INSUFFICIENT_TOKENS: "Insufficient amount of tokens",
  TOKENS_STAKED_SUCCESSFULLY: (amount: number) => `${amount.toFixed(2)} STK staked successfully`,
  TOKENS_CLAIMED_SUCCESSFULLY: (amount: number) => `${amount.toFixed(2)} STK claimed successfully`,
  NO_EARNINGS_TO_CLAIM: "No earnings available at this time",

  // Communicating with users
  MESSAGE_SENT_SUCCESSFULLY: (email: string) => `Message sent successfully to ${email}`,

  // General
  SOMETHING_WENT_WRONG: "Something went wrong, please try again later",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions to perform this action",

  // Withdrawals
  WITHDRAWAL_REQUEST_SUBMITTED_SUCCESSFULLY: (amount: number) =>
    `You successfully requested the withdrawal of ${amount.toFixed(2)} STK`,
};
