"use client";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { Theme } from "@/types/theme.enum";
import { showCustomToast } from "@/utils/show-custom-toast";
import { Pencil, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import DragAndDropCustom from "./drag-and-drop";
import { ImageItem } from "./images-review";

interface Props {
  mode: "create" | "edit";
  theme?: string;
  onImagesChange?: (files: File[]) => void;
  maxImages?: number;
  currentCount?: number;
  title?: string;
  description?: string;
  additionalContent?: React.ReactNode;
  onEditStart?: () => void;
  onEditComplete?: () => void;
  editingActive?: boolean;
  value?: File[];
}

const ImagesUpload: React.FC<Props> = ({
  mode,
  theme = Theme.LIGHT,
  onImagesChange,
  maxImages = 10,
  currentCount = 0,
  title = "Upload Images",
  description = "Add images to provide visual details",
  additionalContent,
  onEditStart,
  onEditComplete,
  editingActive = false,
  value,
}) => {
  const { confirm } = useConfirmation();
  const [editMode, setEditMode] = useState(mode === "create" || editingActive);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [localNewImages, setLocalNewImages] = useState<File[]>([]);
  const [zoomedImage, setZoomedImage] = useState<ImageItem | null>(null);

  const isInternalUpdate = useRef(false);

  useEffect(() => {
    setEditMode(mode === "create" || editingActive);
  }, [editingActive, mode]);

  useEffect(() => {
    const urls = localNewImages.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [localNewImages]);

  useEffect(() => {
    if (onImagesChange && localNewImages.length > 0) {
      console.log("Notifying parent of image changes:", localNewImages.length);
      onImagesChange(localNewImages);
    }
    isInternalUpdate.current = false;
  }, [localNewImages, onImagesChange]);

  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(localNewImages)) {
      setLocalNewImages(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleFilesSelected = (files: File[]) => {
    try {
      const currentTotal = currentCount + localNewImages.length;
      const slotsAvailable = maxImages - currentTotal;
  
      if (slotsAvailable <= 0) {
        showCustomToast(`Maximum of ${maxImages} images reached.`, {
          action: {
            label: "OK",
            onClick: () => {
              return true;
            },
          },
        });
        return;
      }
  
      const filesToAdd = files.length > slotsAvailable ? files.slice(0, slotsAvailable) : files;
  
      if (files.length > slotsAvailable) {
        showCustomToast(`Maximum of ${maxImages} images reached.`, {
          action: {
            label: "OK",
            onClick: () => {
              return true;
            },
          },
        });
      }

      isInternalUpdate.current = true;
      setLocalNewImages((prev) => [...prev, ...filesToAdd]);
    } catch (err) {
      console.error("Error handling files:", err);
    }
  };

  const handleDeleteNewImage = async (idx: number) => {
    const result = await confirm({
      title: "Delete Image",
      description: "Are you sure you want to delete this image?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (result) {
      setLocalNewImages((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="mb-4 flex flex-col">
      <div className="mb-1 flex items-center justify-between">
        <div className="mb-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        {additionalContent}
      </div>

      {localNewImages.length > 0 && (
        <div className="mb-4 flex w-full flex-wrap gap-2">
          {localNewImages.map((file, idx) => {
            const previewUrl = newImagePreviews[idx];
            if (!previewUrl) return null;
            return (
              <div key={idx} className="group relative">
                <div className="relative">
                  <Image
                    src={previewUrl}
                    width={96}
                    height={64}
                    className="h-16 w-24 cursor-pointer rounded border object-cover"
                    alt="preview"
                    onClick={() => setZoomedImage({ url: previewUrl })}
                  />
                  <div className="absolute bottom-1 right-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  className="absolute right-1 top-1 z-10 rounded-full bg-white/80 p-1 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => handleDeleteNewImage(idx)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload controls */}
      <div>
        {mode === "edit" && !editMode && (
          <button
            className="flex items-center gap-2 rounded bg-gray-200 px-3 py-1 text-blue-600 hover:bg-gray-300"
            onClick={() => {
              setEditMode(true);
              if (onEditStart) onEditStart();
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit Images
          </button>
        )}

        {(mode === "create" || editMode) && (
          <div className="flex flex-col items-center">
            {/* Replace button with DragAndDropArea */}
            <div className="w-full">
              <DragAndDropCustom
                theme={theme}
                onFilesSelected={handleFilesSelected}
                maxImages={maxImages}
                currentCount={currentCount + localNewImages.length}
              />
            </div>

            {mode === "edit" && editMode && (
              <button
                className="mt-2 text-xs text-gray-600 underline"
                onClick={() => {
                  if (onImagesChange && localNewImages.length > 0) {
                    console.log("Finalizing image changes on Done click:", localNewImages.length);
                    onImagesChange(localNewImages);
                  }
                  
                  setEditMode(false);
                  if (onEditComplete) onEditComplete();
                }}
              >
                Done Editing Images
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image count indicator */}
      <div className="mt-2 text-xs text-gray-500">
        {currentCount + localNewImages.length} of {maxImages} images
      </div>

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80">
          <button
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white"
            onClick={() => setZoomedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <Image
            src={zoomedImage.url}
            alt=""
            width={900}
            height={600}
            className="max-h-[90vh] max-w-[95vw] rounded object-contain shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ImagesUpload;
