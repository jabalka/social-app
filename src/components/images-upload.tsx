"use client";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { Pencil, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
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
  onEditComplete?: () => void;
}

const ImagesUpload: React.FC<Props> = ({
  mode,
  onImagesChange,
  maxImages = 10,
  currentCount = 0,
  title = "Upload Images",
  description = "Add images to provide visual details",
  additionalContent,
  onEditComplete,
}) => {
  const { confirm } = useConfirmation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editMode, setEditMode] = useState(mode === "create");
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [localNewImages, setLocalNewImages] = useState<File[]>([]);
  const [zoomedImage, setZoomedImage] = useState<ImageItem | null>(null);

  // Generate previews for new images
  useEffect(() => {
    const urls = localNewImages.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [localNewImages]);

  useEffect(() => {
    if (onImagesChange == null) return;
    onImagesChange(localNewImages);
  }, [localNewImages, onImagesChange]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    try {
      const currentTotal = currentCount + localNewImages.length;
      const slotsAvailable = maxImages - currentTotal;

      if (slotsAvailable <= 0) {
        alert(`Maximum of ${maxImages} images reached (${currentTotal} already added).`);
        e.target.value = "";
        return;
      }

      const filesArray = Array.from(files);
      const filesToAdd = filesArray.length > slotsAvailable ? filesArray.slice(0, slotsAvailable) : filesArray;

      if (filesArray.length > slotsAvailable) {
        alert(`Only adding ${slotsAvailable} of ${filesArray.length} images to stay within the limit of ${maxImages}.`);
      }

      setLocalNewImages((prev) => [...prev, ...filesToAdd]);
    } catch (err) {
      console.error("Error handling files:", err);
    }

    e.target.value = "";
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

  const handleEditComplete = () => {
    setEditMode(false);
    if (onEditComplete) {
      onEditComplete();
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

      {/* New images preview */}
      {localNewImages.length > 0 && (
        <div className="mb-4 flex w-full flex-wrap gap-2">
          {localNewImages.map((file, idx) => {
            const previewUrl = newImagePreviews[idx];
            if (!previewUrl) return null;
            return (
              <div key={idx} className="group relative">
                <Image
                  src={previewUrl}
                  width={96}
                  height={64}
                  className="h-16 w-24 cursor-pointer rounded border object-cover"
                  alt="preview"
                  onClick={() => setZoomedImage({ url: previewUrl })}
                />
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
            onClick={() => setEditMode(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit Images
          </button>
        )}

        {(mode === "create" || editMode) && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
            >
              <Upload className="h-5 w-5" /> Add Images
            </button>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
            {mode === "edit" && editMode && (
              <button 
                className="mt-2 text-xs text-gray-600 underline" 
                onClick={handleEditComplete}
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