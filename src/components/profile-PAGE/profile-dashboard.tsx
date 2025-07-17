"use client";
import { MAX_NAME_LENGTH, MAX_USERNAME_LENGTH } from "@/constants";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { USER_ROLES } from "@/lib/user-roles";
import { CommentWithLikes, Reply } from "@/models/comment";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { ChartColumn, Check, Pencil, X } from "lucide-react";
import Image from "next/image";
import DefaultAvatar from "public/images/default-avatar.png";

import React, { useEffect, useRef, useState } from "react";
import GlowingGreenButton from "../glowing-green-button";
import GlowingPinkButton from "../glowing-pink-button";
import IconWithTooltip from "../tooltip-with-icon";

const ProfileDashboard: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const { user, setUser } = useSafeUser();

  const initialUserRef = useRef<typeof user | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const matchedRole = USER_ROLES.find((r) => r.id === user?.role?.id);

  const [editName, setEditName] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [usernameInput, setUsernameInput] = useState(user?.username ?? "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [projectLikeCount, setProjectLikeCount] = useState<number>(0);
  const [commentLikeCount, setCommentLikeCount] = useState<number>(0);

  const fileImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch("/api/user/comments-likes");
        const data = await res.json();

        const commentLikes = data.comments.reduce((total: number, comment: CommentWithLikes) => {
          const replyLikes = comment.replies?.reduce((sum: number, reply: Reply) => sum + reply.likes.length, 0);
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
      console.error("Image upload failed");
      return null;
    }

    const { url } = await res.json();
    return url;
  };

  const handleSave = async () => {
    const nameValidation = validateName(nameInput);
    const usernameValidation = validateUsername(usernameInput);
    setNameError(nameValidation);
    setUsernameError(usernameValidation);
    if (nameValidation || usernameValidation) return;

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

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setUser(updated);
      initialUserRef.current = updated;

      setHasUnsavedChanges(false);
      setSelectedImage(null);
      setEditName(false);
      setEditUsername(false);

      // Optionally: toast("Saved!") instead of reload
    } catch (err) {
      console.error("Failed to save", err);
      alert("Update failed. Try again.");
    }
  };

  const disableSave = !!validateName(nameInput) || !!validateUsername(usernameInput);

  console.log("user info:  ", user);
  return (
    <>
      <div className="mx-auto mt-8 rounded-3xl border-2 border-zinc-400/10 bg-[#f0e3dd] px-24 py-8 shadow-2xl backdrop-blur-md dark:border-zinc-700/40 dark:bg-[#f0e3dd]/10 md:max-w-2xl md:px-48 md:py-28 lg:max-w-4xl xl:max-w-5xl">
        <div className="relative -mt-2 pb-4 text-center md:-mt-20 md:pb-16">
          <h1 className="text-2xl font-bold">Profile Details</h1>
        </div>

        <div className="flex w-full flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          {/* Profile Image */}
          <div className="relative rounded-full p-[1px]">
            <div className="group">
              <div
                className={cn(
                  "relative h-48 w-32 overflow-hidden rounded-full outline-2 outline-offset-[2px] transition-transform duration-300 hover:scale-105 md:flex-shrink-0",
                  {
                    "bg-[#bda69c66] hover:outline-[#3c2f27]": theme === Theme.LIGHT,
                    "bg-[#6f6561c4] hover:outline-[#3c2f27]": theme === Theme.DARK,
                  },
                )}
              >
                <Image
                  src={user?.image ?? DefaultAvatar}
                  alt="Profile"
                  width={320}
                  height={320}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <span
                className={cn("pointer-events-none absolute -inset-[5px] rounded-full", {
                  "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
                  "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
                })}
              />
            </div>

            <IconWithTooltip
              id="edit-image"
              icon={Pencil}
              content="Change Image"
              theme={theme}
              iconClassName="text-blue-500 h-4 w-4"
              onClick={() => fileImageInputRef.current?.click()}
            />
          </div>

          <input
            type="file"
            ref={fileImageInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedImage(file);
              }
            }}
            className="hidden"
          />

          {/* Right Column */}
          <div className="flex w-full flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <label className="text-sm font-medium">Name:</label>
              <div className="flex max-w-52 items-center gap-2">
                {editName ? (
                  <>
                    <div className="group relative">
                      <input
                        value={nameInput}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s{2,}/g, " ");
                          setNameInput(value);
                          setNameError(validateName(value));
                        }}
                        className="group max-w-40 rounded border px-2 py-1 text-sm"
                      />
                      {nameError && (
                        <div
                          className={cn(
                            "absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs font-semibold transition-all duration-200",
                            {
                              "scale-100 opacity-100": !!nameError,
                              "scale-0 opacity-0": !nameError,
                              "bg-[#dbccc5] text-red-500": theme === Theme.LIGHT,
                              "bg-[#5e5753] text-red-500": theme === Theme.DARK,
                            },
                          )}
                        >
                          {nameError}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <span>
                    {nameInput || (
                      <span
                        className={cn({
                          "text-zinc-300": theme === Theme.LIGHT,
                          "text-zinc-700": theme === Theme.DARK,
                        })}
                      >
                        -- N/A --
                      </span>
                    )}
                  </span>
                )}
                {editName ? (
                  <>
                    <button
                      onClick={() => {
                        setEditName(false);
                        setNameInput(initialUserRef?.current?.name ?? "");
                        setNameError(null);
                      }}
                    >
                      <X className="h-6 w-6 cursor-pointer text-red-600 hover:text-red-700" />
                    </button>
                    {nameInput !== initialUserRef.current?.name && !nameError && (
                      <button
                        onClick={() => {
                          setEditName(false);
                          if (nameInput !== initialUserRef.current?.name) {
                            setHasUnsavedChanges(true);
                          }
                        }}
                      >
                        <Check className="h-6 w-6 cursor-pointer text-green-600 hover:text-green-700" />
                      </button>
                    )}
                  </>
                ) : (
                  <IconWithTooltip
                    id="edit-name"
                    icon={Pencil}
                    content="Edit Name"
                    theme={theme}
                    iconClassName="text-blue-500 h-4 w-4"
                    onClick={() => setEditName(true)}
                  />
                )}
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <label className="text-sm font-medium">Username:</label>
              <div className="flex max-w-52 items-center gap-2">
                {editUsername ? (
                  <>
                    <div className="group relative">
                      <input
                        value={usernameInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setUsernameInput(value);
                          setUsernameError(validateUsername(value));
                        }}
                        className="group max-w-40 rounded border px-2 py-1 text-sm"
                      />
                      {usernameError && (
                        <div
                          className={cn(
                            "absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs font-semibold transition-all duration-200",
                            {
                              "scale-100 opacity-100": !!usernameError,
                              "scale-0 opacity-0": !usernameError,
                              "bg-[#dbccc5] text-red-500": theme === Theme.LIGHT,
                              "bg-[#5e5753] text-red-500": theme === Theme.DARK,
                            },
                          )}
                        >
                          {usernameError}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <span>
                    {usernameInput || (
                      <span
                        className={cn({
                          "text-zinc-300": theme === Theme.LIGHT,
                          "text-zinc-700": theme === Theme.DARK,
                        })}
                      >
                        -- N/A --
                      </span>
                    )}
                  </span>
                )}
                {editUsername ? (
                  <>
                    <button
                      onClick={() => {
                        setEditUsername(false);
                        setUsernameInput(initialUserRef?.current?.username ?? "");
                        setUsernameError(null);
                      }}
                    >
                      <X className="h-6 w-6 cursor-pointer text-red-600 hover:text-red-700" />
                    </button>
                    {usernameInput !== initialUserRef.current?.username && !usernameError && (
                      <button
                        onClick={() => {
                          setEditUsername(false);
                          if (usernameInput !== initialUserRef.current?.username) {
                            setHasUnsavedChanges(true);
                          }
                        }}
                      >
                        <Check className="h-6 w-6 cursor-pointer text-green-600 hover:text-green-700" />
                      </button>
                    )}
                  </>
                ) : (
                  <IconWithTooltip
                    id="edit-username"
                    icon={Pencil}
                    content="Edit Username"
                    theme={theme}
                    iconClassName="text-blue-500 h-4 w-4"
                    onClick={() => setEditUsername(true)}
                  />
                )}
              </div>
            </div>

            {/* Role */}
            <div className="relative flex flex-row gap-1 md:items-center md:gap-2">
              <label className="text-sm font-medium">Your Role:</label>

              {matchedRole && (
                <IconWithTooltip
                  id="your-role"
                  theme={theme}
                  icon={matchedRole?.icon}
                  iconClassName="h-7 w-7"
                  content={matchedRole?.name}
                />
              )}

              <IconWithTooltip
                id="info-roles"
                theme={theme}
                iconClassName="h-4 w-4"
                tooltipPlacement="left"
                content={
                  <>
                    <p className="mb-1 font-semibold">{matchedRole?.name} – your assigned role.</p>
                    <p className="mb-1">Other roles:</p>
                    <ul className="ml-6 list-disc">
                      {USER_ROLES.filter((r) => r.id !== matchedRole?.id).map((r) => (
                        <li key={r.id}>
                          {r.name} <r.icon />
                        </li>
                      ))}
                    </ul>
                  </>
                }
              />
            </div>

            {/* Stats Section */}
            <div
              className={cn("mt-6 flex flex-col gap-2 rounded-md p-4 shadow md:w-64 lg:w-80", {
                "bg-[#998a8361] text-zinc-700": theme === Theme.LIGHT,
                "bg-[#8c817b41] text-zinc-300": theme === Theme.DARK,
              })}
            >
              <IconWithTooltip
                id="your-statistic"
                className="flex items-center justify-center"
                theme={theme}
                icon={ChartColumn}
                iconClassName="h-6 w-6"
                content="Personal Statistic"
              />
              <p>Total Projects: {user?.projects.length}</p>
              <p>Total Comments: {user?.comments.length}</p>
              <p>Total Likes on Projects: {projectLikeCount}</p>
              <p>Total Likes on Comments: {commentLikeCount}</p>
            </div>
          </div>
        </div>
        {hasInitialized && hasUnsavedChanges && (
          <div className="flex justify-center gap-4 pt-8">
            <GlowingPinkButton
              onClick={() => {
                setNameInput(initialUserRef.current?.name ?? "");
                setUsernameInput(initialUserRef.current?.username ?? "");
                setSelectedImage(null);
                setEditName(false);
                setEditUsername(false);
                setHasUnsavedChanges(false);
                setNameError(null);
                setUsernameError(null);
              }}
              className="h-8 w-24"
            >
              CANCEL
            </GlowingPinkButton>

            <GlowingGreenButton onClick={handleSave} disabled={disableSave} className="h-8 w-24">
              SAVE
            </GlowingGreenButton>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileDashboard;
