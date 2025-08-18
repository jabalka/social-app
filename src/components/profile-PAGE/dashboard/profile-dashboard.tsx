"use client";
import { MAX_NAME_LENGTH, MAX_USERNAME_LENGTH } from "@/constants";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { CommentWithLikes, Reply } from "@/models/comment.types";

import ActionButtons from "@/components/shared/action-buttons";
import { showCustomToast } from "@/utils/show-custom-toast";
import React, { useEffect, useRef, useState } from "react";
import ProfileEditableField from "./profile-editable-field";
import ProfileImage from "./profile-image";
import ProfileRoleDisplay from "./profile-role-display";
import ProfileStatistics from "./profile-statistics";

// Safely derive a "report" count without using `any`
function getReportCount(user: unknown): number {
  if (!user || typeof user !== "object") return 0;

  const record = user as Record<string, unknown>;
  const reports = record["reports"];
  if (Array.isArray(reports)) return reports.length;

  const issues = record["issues"];
  if (Array.isArray(issues)) return issues.length;

  return 0;
}

const ProfileDashboard: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const { user, setUser } = useSafeUser();

  const initialUserRef = useRef<typeof user | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [usernameInput, setUsernameInput] = useState(user?.username ?? "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [projectLikeCount, setProjectLikeCount] = useState<number>(0);
  const [commentLikeCount, setCommentLikeCount] = useState<number>(0);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch("/api/user/comments-likes");
        const data: { comments: CommentWithLikes[]; projectLikeCount: number } = await res.json();

        const commentLikes = data.comments.reduce((total: number, comment: CommentWithLikes) => {
          const replyLikes = comment.replies?.reduce((sum: number, reply: Reply) => sum + reply.likes.length, 0) ?? 0;
          return total + comment.likes.length + replyLikes;
        }, 0);

        setProjectLikeCount(data.projectLikeCount || 0);
        setCommentLikeCount(commentLikes || 0);
      } catch (error) {
        console.error("Failed to fetch likes summary", error);
      }
    };

    fetchLikes();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (user && !hasInitialized) {
      initialUserRef.current = user;
      setNameInput(user.name ?? "");
      setUsernameInput(user.username ?? "");
      setHasInitialized(true);
    }
  }, [user, hasInitialized]);

  useEffect(() => {
    if (!hasInitialized || !initialUserRef.current) return;

    const nameChanged = nameInput.trim() !== (initialUserRef.current.name ?? "").trim();
    const usernameChanged = usernameInput.trim() !== (initialUserRef.current.username ?? "").trim();
    const imageChanged = !!selectedImage;

    setHasUnsavedChanges(nameChanged || usernameChanged || imageChanged);
  }, [nameInput, usernameInput, selectedImage, hasInitialized]);

  const validateName = (value: string) => {
    const cleaned = value.replace(/\s+/g, " ").trim();
    const wordCount = cleaned.split(" ").filter(Boolean).length;
    if (cleaned.length > MAX_NAME_LENGTH) return "Name must be ≤ 18 characters.";
    if (wordCount > 2) return "Only 2 words allowed.";
    return null;
  };

  const validateUsername = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > MAX_USERNAME_LENGTH) return "Username must be ≤ 15 characters.";
    return null;
  };

  const uploadImageAndGetUrl = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/user/upload-profile-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      showCustomToast(`Image Upload Unsuccessful`, {
        action: {
          label: "OK",
          onClick: () => true,
        },
      });
      return null;
    }

    const { url } = await res.json();
    return url;
  };

  const handleSave = async () => {
    const nameValidation = validateName(nameInput);
    const usernameValidation = validateUsername(usernameInput);

    if (nameValidation || usernameValidation) {
      showCustomToast(`Please fix the validation errors`, {
        action: { label: "OK", onClick: () => true },
      });
      return;
    }

    try {
      let imageUrl = user?.image;

      if (selectedImage) {
        const uploaded = await uploadImageAndGetUrl(selectedImage);
        if (uploaded) imageUrl = uploaded;
      }

      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          username: usernameInput,
          image: imageUrl,
        }),
      });

      if (!res.ok) {
        showCustomToast(`Update Failed`, {
          action: { label: "OK", onClick: () => true },
        });
        return;
      }

      const updated = await res.json();
      setUser(updated);
      initialUserRef.current = updated;

      setHasUnsavedChanges(false);
      setSelectedImage(null);

      showCustomToast(`Changes Saved Successfully`, {
        action: { label: "OK", onClick: () => true },
      });
    } catch {
      showCustomToast(`An error occurred`, {
        action: { label: "OK", onClick: () => true },
      });
    }
  };

  const handleCancel = () => {
    if (initialUserRef.current) {
      setNameInput(initialUserRef.current.name ?? "");
      setUsernameInput(initialUserRef.current.username ?? "");
      setSelectedImage(null);
      setHasUnsavedChanges(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      const res = await fetch("/api/user/upload-profile-image", {
        method: "DELETE",
      });

      if (!res.ok) {
        showCustomToast(`Failed to delete profile image`, {
          action: {
            label: "OK",
            onClick: () => true,
          },
        });
        return;
      }

      await res.json();

      if (user) {
        const updatedUser = {
          ...user,
          image: null,
        };

        setUser(updatedUser);

        if (initialUserRef.current) {
          initialUserRef.current = updatedUser;
        }
      }

      showCustomToast(`Profile image deleted successfully`, {
        action: {
          label: "OK",
          onClick: () => true,
        },
      });
    } catch (error) {
      console.error("Error deleting profile image:", error);
      showCustomToast(`An error occurred while deleting profile image`, {
        action: {
          label: "OK",
          onClick: () => true,
        },
      });
    }
  };

  const disableSave = !hasUnsavedChanges || !!validateName(nameInput) || !!validateUsername(usernameInput);

  return (
    <>
      <div className="mx-auto mt-8 rounded-3xl border-2 border-zinc-400/10 bg-[#f0e3dd] px-24 pt-8 shadow-2xl backdrop-blur-md dark:border-zinc-700/40 dark:bg-[#f0e3dd]/10 md:max-w-2xl md:px-48 md:py-28 lg:max-w-4xl xl:max-w-5xl">
        <div className="relative -mt-2 pb-4 text-center md:-mt-20 md:pb-16">
          <h1 className="text-2xl font-bold">Profile Details</h1>
        </div>

        <div className="flex w-full flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          {/* Left Column */}
          <ProfileImage
            image={user?.image ?? null}
            theme={theme}
            onImageChange={setSelectedImage}
            onImageDelete={handleImageDelete}
          />

          {/* Right Column */}
          <div className="flex w-full flex-col gap-4">
            <ProfileEditableField
              label="Name"
              value={nameInput}
              originalValue={initialUserRef.current?.name ?? ""}
              theme={theme}
              onSave={setNameInput}
              onCancel={() => setNameInput(initialUserRef.current?.name ?? "")}
              validate={validateName}
              maxLength={MAX_NAME_LENGTH}
            />

            <ProfileEditableField
              label="Username"
              value={usernameInput}
              originalValue={initialUserRef.current?.username ?? ""}
              theme={theme}
              onSave={setUsernameInput}
              onCancel={() => setUsernameInput(initialUserRef.current?.username ?? "")}
              validate={validateUsername}
              maxLength={MAX_USERNAME_LENGTH}
            />

            <ProfileRoleDisplay roleId={user?.role?.id ?? ""} theme={theme} />

            <ProfileStatistics
              theme={theme}
              userId={user?.id}
              projectCount={user?.projects.length ?? 0}
              ideaCount={user?.ideas?.length ?? 0}
              reportCount={getReportCount(user)}
              commentCount={user?.comments.length ?? 0}
              projectLikeCount={projectLikeCount}
              commentLikeCount={commentLikeCount}
            />
          </div>
        </div>
        {hasInitialized && hasUnsavedChanges && (
          <div className="mt-8 flex justify-center">
            <ActionButtons
              onSubmit={handleSave}
              onCancel={handleCancel}
              disabled={disableSave}
              cancelText="Cancel"
              submitText="Save"
              position="center"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileDashboard;
