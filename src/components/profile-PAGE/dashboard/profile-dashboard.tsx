"use client";
import { MAX_NAME_LENGTH, MAX_USERNAME_LENGTH } from "@/constants";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { CommentWithLikes, Reply } from "@/models/comment.types";

import LoaderModal from "@/components/common/loader-modal";
import SectionBox from "@/components/common/section-box";
import SurfacePanel from "@/components/common/surface-panel";
import ActionButtons from "@/components/shared/action-buttons";
import { cn } from "@/utils/cn.utils";
import { showCustomToast } from "@/utils/show-custom-toast";
import React, { useEffect, useRef, useState } from "react";
import ProfileEditableField from "./profile-editable-field";
import ProfileImage from "./profile-image";
import ProfileRoleDisplay from "./profile-role-display";
import ProfileStatistics from "./profile-statistics";

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

  const [loading, setLoading] = useState(false);

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

  const projectCount = user?.projects?.length ?? 0;
  const ideaCount = user?.ideas?.length ?? 0;
  const reportCount = user?.issueReports?.length ?? 0;
  const commentCount = user?.comments?.length ?? 0;

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

    const res = await fetch("/api/user/upload-profile-image", { method: "POST", body: formData });
    if (!res.ok) {
      showCustomToast(`Image Upload Unsuccessful`, { action: { label: "OK", onClick: () => true } });
      return null;
    }
    const { url } = await res.json();
    return url;
  };

  const handleSave = async () => {
    const nameValidation = validateName(nameInput);
    const usernameValidation = validateUsername(usernameInput);
    if (nameValidation || usernameValidation) {
      showCustomToast(`Please fix the validation errors`, { action: { label: "OK", onClick: () => true } });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = user?.image;
      if (selectedImage) {
        const uploaded = await uploadImageAndGetUrl(selectedImage);
        if (uploaded) imageUrl = uploaded;
      }

      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput, username: usernameInput, image: imageUrl }),
      });

      if (!res.ok) {
        showCustomToast(`Update Failed`, { action: { label: "OK", onClick: () => true } });
        return;
      }

      const updated = await res.json();
      setUser(updated);
      initialUserRef.current = updated;

      setHasUnsavedChanges(false);
      setSelectedImage(null);

      showCustomToast(`Changes Saved Successfully`, { action: { label: "OK", onClick: () => true } });
    } catch {
      showCustomToast(`An error occurred`, { action: { label: "OK", onClick: () => true } });
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      const res = await fetch("/api/user/upload-profile-image", { method: "DELETE" });
      if (!res.ok) {
        showCustomToast(`Failed to delete profile image`, { action: { label: "OK", onClick: () => true } });
        return;
      }
      await res.json();

      if (user) {
        const updatedUser = { ...user, image: null };
        setUser(updatedUser);
        if (initialUserRef.current) initialUserRef.current = updatedUser;
      }

      showCustomToast(`Profile image deleted successfully`, { action: { label: "OK", onClick: () => true } });
    } catch (error) {
      console.error("Error deleting profile image:", error);
      showCustomToast(`An error occurred while deleting profile image`, {
        action: { label: "OK", onClick: () => true },
      });
    } finally {
      setLoading(false);
    }
  };

  const disableSave = !hasUnsavedChanges || !!validateName(nameInput) || !!validateUsername(usernameInput);

  return (
    <>
      {loading && <LoaderModal />}

      <SectionBox className="mt-1">
        <h1 className="text-center text-2xl font-bold">Profile Details</h1>

        <SurfacePanel className="mb-6 mt-4">
          <div className="mx-auto w-full ">
            <div className="grid grid-cols-1 items-start justify-center gap-8 md:grid-cols-[auto,auto]">

              <div className="justify-self-center">
                <ProfileImage
                  image={user?.image ?? null}
                  theme={theme}
                  onImageChange={setSelectedImage}
                  onImageDelete={handleImageDelete}
                />
              </div>

              <div className="flex w-full max-w-[560px] flex-col gap-4 justify-self-center">
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
              </div>

              <div className="flex justify-center md:col-span-2">
                <ProfileStatistics
                  theme={theme}
                  userId={user?.id}
                  projectCount={projectCount}
                  ideaCount={ideaCount}
                  reportCount={reportCount}
                  commentCount={commentCount}
                  projectLikeCount={projectLikeCount}
                  commentLikeCount={commentLikeCount}
                />
              </div>
            </div>
          </div>
        </SurfacePanel>

        <div className="mt-0 flex min-h-[48px] justify-center">
          <div
            className={cn(
              "transition-all duration-200",
              hasUnsavedChanges ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
            )}
          >
            <ActionButtons
              onSubmit={handleSave}
              onCancel={handleCancel}
              disabled={disableSave}
              cancelText="Cancel"
              submitText="Save"
              position="center"
            />
          </div>
        </div>
      </SectionBox>
    </>
  );
};

export default ProfileDashboard;
