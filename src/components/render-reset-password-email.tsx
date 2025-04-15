// lib/emails/render-reset-password-email.tsx
import * as React from "react";
import ResetPasswordEmail from "./reset-password-email";

export function getResetPasswordEmailComponent(resetUrl: string): React.ReactElement {
  return <ResetPasswordEmail resetUrl={resetUrl} />;
}
