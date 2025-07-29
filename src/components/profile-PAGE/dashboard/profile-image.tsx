"use client";
import IconWithTooltip from "@/components/icon-with-tooltip";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import DefaultAvatar from "public/images/profile-default-avatar.png";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  image: string | null;
  theme: string;
  onImageChange: (file: File | null) => void;
}

const ProfileImage: React.FC<Props> = ({ image, theme, onImageChange }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileImageInputRef = useRef<HTMLInputElement | null>(null);

    const { confirm } = useConfirmation();

  useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setPreviewImageUrl(objectUrl);
      onImageChange(selectedImage);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedImage, onImageChange]);

  const handleCancelImage = () => {
    setSelectedImage(null);
    setPreviewImageUrl(null);
    onImageChange(null);
    // Reset the file input to allow re-selecting the same file
    if (fileImageInputRef.current) {
      fileImageInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    const result = await confirm({
      title: "Delete Image",
      description: "Are you sure you want to delete your profile picture?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if(result){
      console.log("Need to implement Back-End logic to delete user image!")

      // try {
      //   // Call your API to delete the image
      //   const res = await fetch("/api/user/delete-profile-image", {
      //     method: "POST",
      //   });
    
      //   if (!res.ok) {
      //     showCustomToast(`Failed to delete image`, {
      //       action: { label: "OK", onClick: () => true },
      //     });
      //     return;
      //   }
    
      //   // Update local state
      //   const updated = await res.json();
      //   setUser(updated);
      //   initialUserRef.current = updated;
        
      //   showCustomToast(`Profile image deleted`, {
      //     action: { label: "OK", onClick: () => true },
      //   });
      // } catch (error) {
      //   showCustomToast(`An error occurred`, {
      //     action: { label: "OK", onClick: () => true },
      //   });
      // }
    }

  };

  const hasCustomImage = !!image && image !== DefaultAvatar.src;

  return (
    <div className="relative rounded-full p-[1px]">
      <div className="group relative w-full overflow-hidden duration-300 hover:z-20 hover:scale-[1.8]">
        <div
          className={cn(
            "relative h-48 w-32 overflow-hidden rounded-full outline-2 outline-offset-[2px] transition-transform",
            {
              "bg-[#bda69c66]": theme === Theme.LIGHT,
              "bg-[#6f6561c4]": theme === Theme.DARK,
            },
          )}
        >
          <Image
            src={previewImageUrl || image || DefaultAvatar}
            alt="Profile"
            width={320}
            height={320}
            className="h-full w-full object-cover"
            priority
          />

          <span
            className={cn("pointer-events-none absolute -inset-[0px] z-10 rounded-full", {
              "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
              "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
            })}
          />
        </div>
      </div>
      <div className="absolute -bottom-5 left-0">
        <IconWithTooltip
          id="edit-image"
          icon={Pencil}
          content="Change Image"
          theme={theme}
          iconClassName="text-blue-500 h-4 w-4"
          tooltipPlacement="bottom"
          onClick={() => fileImageInputRef.current?.click()}
        />
      </div>

      {previewImageUrl ? (
        <div className="absolute -bottom-6 right-0">
          <button onClick={handleCancelImage}>
            <X className="h-6 w-6 cursor-pointer text-red-600 hover:text-red-700" />
          </button>
        </div>
      ) : hasCustomImage && (
        <div className="absolute -bottom-6 right-0">
          <IconWithTooltip
            id="delete-image"
            icon={Trash2}
            content="Delete Profile Image"
            theme={theme}
            iconClassName="text-red-500 h-5 w-5"
            tooltipPlacement="bottom"
            onClick={handleDeleteImage}
          />
        </div>
      )}

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
    </div>
  );
};

export default ProfileImage;
