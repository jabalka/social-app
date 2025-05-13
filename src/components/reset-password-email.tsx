/* eslint-disable @next/next/no-img-element */
import * as React from "react";

interface ResetPasswordEmailProps {
  userName?: string;
  resetUrl: string;
}

const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({ userName = "there", resetUrl }) => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#1a1a1a", backgroundColor: "#f4f4f4", padding: "40px 0" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", background: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(to right, #bda69c, #72645f, #443d3a)", padding: "4px", textAlign: "center" }}>
   
          <img
            src="https://yypaxndddrycnlixcoey.supabase.co/storage/v1/object/public/civil-dev//CivDev%20no%20plants%20graphic%20logo.png"
            alt="CivilDev Logo"
            width={240}
            style={{ marginBottom: "4px" }}
          />
          <h1 style={{ color: "#ffffff", margin: 0, fontSize: "20px" }}>Reset Your Password</h1>
        </div>

        {/* Body */}
        <div style={{ padding: "30px", fontSize: "16px", lineHeight: "1.6" }}>
          <p>Hi {userName},</p>
          <p>We received a request to reset your password. Click the button below to set a new one:</p>

          <div style={{ textAlign: "center", margin: "30px 0" }}>
            <a
              href={resetUrl}
              style={{
                backgroundColor: "#443d3a",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "4px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Reset Password
            </a>
          </div>

          <p>If you didn’t request this, just ignore this email.</p>
          <p>Thanks,<br />The CivilDev Team</p>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#2b2725", padding: "20px", textAlign: "center", color: "#dec7bd", fontSize: "12px" }}>
          <p style={{ margin: "5px 0" }}>© {new Date().getFullYear()} jabalka. All rights reserved.</p>
          <div style={{ marginTop: "10px" }}>
            <a href="https://twitter.com/civildev" style={{ margin: "0 8px", color: "#dec7bd" }}>Twitter</a>
            <a href="https://github.com/civildev" style={{ margin: "0 8px", color: "#dec7bd" }}>GitHub</a>
            <a href="https://t.me/civildev" style={{ margin: "0 8px", color: "#dec7bd" }}>Telegram</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordEmail;
