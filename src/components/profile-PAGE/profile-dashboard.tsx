"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { USER_ROLES } from "@/lib/user-roles";
import { CommentWithLikes, Reply } from "@/models/comment";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { ChartColumn, Check, Info, Pencil, X } from "lucide-react";
import Image from "next/image";
import DefaultAvatar from "public/images/default-avatar.png";

import React, { useEffect, useRef, useState } from "react";

const ProfileDashboard: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const { user, setUser } = useSafeUser();
  const initialUserRef = useRef(user);

  const matchedRole = USER_ROLES.find((r) => r.id === user?.role?.id);

  const [editName, setEditName] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [usernameInput, setUsernameInput] = useState(user?.username ?? "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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
    const imageChanged = !!selectedImage;
    setHasUnsavedChanges(hasUnsavedChanges || imageChanged);
  }, [hasUnsavedChanges, selectedImage]);

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

      //   if (updatedUser) {
      //     const updated = {
      //       ...updatedUser,
      //       name: nameInput,
      //       username: usernameInput,
      //       image: imageUrl ?? null,
      //     };
      //   }
      setHasUnsavedChanges(false);
      setSelectedImage(null);

      // Optionally: toast("Saved!") instead of reload
    } catch (err) {
      console.error("Failed to save", err);
      alert("Update failed. Try again.");
    }
  };

  console.log("user info:  ", user);
  return (
    <>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center gap-6 px-4">
        <h1 className="text-2xl font-bold">Profile Details</h1>

        <div className="flex w-full flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          {/* Profile Image */}
          <div
            className={cn(
              "group relative h-48 w-32 overflow-hidden rounded-full border-2 transition-transform duration-300 hover:scale-105 md:flex-shrink-0",
              {
                "border-zinc-700": theme === Theme.LIGHT,
                "border-zinc-200": theme === Theme.DARK,
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
          <div className="group relative">
            <button
              onClick={() => fileImageInputRef.current?.click()}
              className="absolute right-36 top-48 text-xs text-blue-500 transition-all duration-300 group-hover:text-orange-700"
            >
              <Pencil className="h-4 w-4" />
              <div
                className={cn(
                  "absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded px-2 py-1 text-xs transition-all group-hover:scale-100",
                  {
                    "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                    "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                  },
                )}
              >
                Change Image
              </div>
            </button>
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
              <div className="flex items-center gap-2">
                {editName ? (
                  <input
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                    }}
                    className="rounded border px-2 py-1 text-sm"
                  />
                ) : (
                  <span>{nameInput || "Not set"}</span>
                )}
                {editName ? (
                  <>
                    <button
                      onClick={() => {
                        setEditName(false);
                        setNameInput(initialUserRef?.current?.name ?? "");
                      }}
                    >
                      <X className="h-6 w-6 cursor-pointer text-red-600 hover:text-red-700" />
                    </button>
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
                  </>
                ) : (
                  <div className="group relative">
                    <button
                      onClick={() => setEditName(true)}
                      className="text-xs text-blue-500 transition-all duration-300 group-hover:text-orange-700"
                    >
                      <Pencil className="h-4 w-4" />
                      <div
                        className={cn(
                          "absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded px-2 py-1 text-xs transition-all group-hover:scale-100",
                          {
                            "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                            "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                          },
                        )}
                      >
                        Edit Name
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <label className="text-sm font-medium">Username:</label>
              <div className="flex items-center gap-2">
                {editUsername ? (
                  <input
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                    }}
                    className="rounded border px-2 py-1 text-sm"
                  />
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
                        const hasChanges = usernameInput !== initialUserRef.current?.username;
                        setEditUsername(hasChanges);
                        setUsernameInput(initialUserRef?.current?.username ?? "");
                      }}
                    >
                      <X className="h-6 w-6 cursor-pointer text-red-600 hover:text-red-700" />
                    </button>
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
                  </>
                ) : (
                  <div className="group relative">
                    <button
                      onClick={() => setEditUsername(true)}
                      className="text-xs text-blue-500 transition-all duration-300 group-hover:text-orange-700"
                    >
                      <Pencil className="h-4 w-4" />
                      <div
                        className={cn(
                          "absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded px-2 py-1 text-xs transition-all group-hover:scale-100",
                          {
                            "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                            "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                          },
                        )}
                      >
                        Edit Username
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <label className="text-sm font-medium">Your Role:</label>
              {matchedRole && (
                <div className="group relative flex items-center justify-center">
                  <matchedRole.icon
                    className={cn("h-5 w-5 transition-colors", {
                      "text-gray-700 group-hover:text-orange-700": theme === Theme.LIGHT,
                      "text-zinc-200 group-hover:text-orange-700": theme === Theme.DARK,
                    })}
                  />
                  <div
                    className={cn(
                      "absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded px-2 py-1 text-xs transition-all group-hover:scale-100",
                      {
                        "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                        "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                      },
                    )}
                  >
                    {matchedRole.name}
                  </div>
                </div>
              )}
              <div className="group relative">
                <Info
                  className={cn("h-4 w-4 cursor-pointer", {
                    "text-gray-600 group-hover:text-orange-700": theme === Theme.LIGHT,
                    "text-zinc-300 group-hover:text-orange-500": theme === Theme.DARK,
                  })}
                />
                <div
                  className={cn(
                    "absolute left-6 top-1/2 z-20 w-60 -translate-y-1/2 scale-0 rounded px-3 py-2 text-xs shadow-md transition-all group-hover:scale-100",
                    {
                      "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                      "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                    },
                  )}
                >
                  <p className="mb-1 font-semibold">{matchedRole!.name} – your assigned role.</p>
                  <p className="mb-1">Other roles:</p>
                  <ul className="ml-2 list-disc">
                    {USER_ROLES.filter((r) => r.id !== matchedRole!.id).map((r) => (
                      <li key={r.id}>
                        {r.name} <r.icon />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div
              className={cn("mt-6 flex flex-col gap-2 rounded-md p-4 shadow", {
                "bg-zinc-100 text-zinc-800": theme === Theme.LIGHT,
                "bg-zinc-800 text-white": theme === Theme.DARK,
              })}
            >
              <div className="relative flex items-center justify-center">
                <div className="group relative flex flex-col items-center">
                  <ChartColumn className="h-6 w-6 transition-all duration-300 group-hover:text-orange-700" />
                  <div
                    className={cn(
                      "absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded px-2 py-1 text-xs transition-all group-hover:scale-100",
                      {
                        "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                        "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                      },
                    )}
                  >
                    Personal Statistic
                  </div>
                </div>
              </div>
              <p>Total Projects: {user?.projects.length}</p>
              <p>Total Comments: {user?.comments.length}</p>
              <p>Total Likes on Projects: {projectLikeCount}</p>
              <p>Total Likes on Comments: {commentLikeCount}</p>
            </div>
          </div>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="mt-6 flex gap-4">
          <button onClick={handleSave} className="rounded bg-green-600 px-4 py-1 text-white hover:bg-green-700">
            SAVE
          </button>
          <button
            onClick={() => {
              setNameInput(initialUserRef.current?.name ?? "");
              setUsernameInput(initialUserRef.current?.username ?? "");
              setSelectedImage(null);
              setEditName(false);
              setEditUsername(false);
              setHasUnsavedChanges(false);
            }}
            className="rounded bg-red-500 px-4 py-1 text-white hover:bg-red-600"
          >
            CANCEL
          </button>
        </div>
      )}
    </>
  );
};

export default ProfileDashboard;
