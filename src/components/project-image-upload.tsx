import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { ChevronLeft, ChevronRight, Pencil, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import React from "react";

type ProjectImage = { id?: string; url: string };

interface ImageUploadProps {
  mode: 'create' | 'view' | 'edit';
  theme?: string;
  existingImages?: ProjectImage[];
  onImagesChange?: (files: File[]) => void;
  onRemoveImage?: (url: string) => void;
  maxImages?: number;
  allowEdit?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  mode,

  existingImages = [],
  onImagesChange,
  onRemoveImage,
  maxImages = 10,
  allowEdit = false
}) => {
  const { confirm } = useConfirmation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [zoomedImage, setZoomedImage] = useState<ProjectImage | null>(null);
  const [editMode, setEditMode] = useState(mode === 'create');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  // Generate previews for new images
  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const imagesCount = existingImages.length;
  const visibleImages = 3;
  const displayedImages = (() => {
    if (imagesCount <= visibleImages) return existingImages;
    return Array.from({ length: visibleImages }).map((_, i) => existingImages[(carouselIndex + i) % imagesCount]);
  })();

  const handlePrev = () => setCarouselIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
  const handleNext = () => setCarouselIndex((prev) => (prev + 1) % imagesCount);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    try {
      const currentTotal = existingImages.length + newImages.length;
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

      const newFilesList = [...newImages, ...filesToAdd];
      setNewImages(newFilesList);
      
      if (onImagesChange) {
        onImagesChange(newFilesList);
      }
    } catch (err) {
      console.error("Error handling files:", err);
    }

    e.target.value = "";
  };

  const handleDeleteImage = async (img: ProjectImage, idx?: number, isNew?: boolean) => {
    const result = await confirm({
      title: "Delete Image",
      description: "Are you sure you want to delete this image?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    
    if (!result) return;
    
    if (isNew && typeof idx === "number") {
      const updatedImages = newImages.filter((_, i) => i !== idx);
      setNewImages(updatedImages);
      if (onImagesChange) {
        onImagesChange(updatedImages);
      }
    } else if (img.url && onRemoveImage) {
      onRemoveImage(img.url);
    }
  };

  return (
    <div className="relative mb-4 flex flex-col items-center">
      {/* Image carousel */}
      {(existingImages.length > 0 || mode === 'view') && (
        <div className="flex w-full items-center justify-center gap-2">
          {imagesCount > visibleImages && (
            <button
              onClick={handlePrev}
              className="rounded-full bg-gray-200 p-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div className="flex gap-2">
            {displayedImages.map((img, idx) => (
              <div key={img.id || idx} className="group relative">
                <Image
                  src={img.url}
                  alt="Project Image"
                  width={150}
                  height={110}
                  className="cursor-pointer rounded border border-gray-300 object-cover shadow"
                  style={{ minWidth: 150, minHeight: 110, maxHeight: 110, maxWidth: 150 }}
                  onClick={() => !editMode && setZoomedImage(img)}
                />
                {editMode && (
                  <button
                    type="button"
                    className="absolute right-1 top-1 z-10 rounded-full bg-white/80 p-1 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleDeleteImage(img, idx, false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {imagesCount > visibleImages && (
            <button
              onClick={handleNext}
              className="rounded-full bg-gray-200 p-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
      
      {/* New images preview */}
      {newImages.length > 0 && (
        <div className="mt-4 flex w-full flex-wrap justify-center gap-2">
          {newImages.map((file, idx) => {
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
                  onClick={() => !editMode && setZoomedImage({ url: previewUrl })}
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 z-10 rounded-full bg-white/80 p-1 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => handleDeleteImage({ id: `new-${idx}`, url: previewUrl }, idx, true)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Edit/Create controls */}
      {mode === 'create' || (mode === 'edit' && allowEdit) ? (
        <div>
          {mode === 'edit' && !editMode && allowEdit && (
            <button
              className="mt-3 flex items-center gap-2 rounded bg-gray-200 px-3 py-1 text-blue-600 hover:bg-gray-300"
              onClick={() => setEditMode(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit Images
            </button>
          )}
          
          {(mode === 'create' || editMode) && (
            <div className="mt-3 flex w-full flex-col items-center">
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
              {mode === 'edit' && (
                <button className="mt-2 text-xs text-gray-600 underline" onClick={() => setEditMode(false)}>
                  Done Editing Images
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}

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

export default ImageUpload;