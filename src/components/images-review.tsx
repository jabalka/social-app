"use client";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export type ImageItem = { id?: string; url: string };

interface Props {
  images: ImageItem[];
  onDeleteImage?: (url: string) => void;
  allowDelete?: boolean;
  visibleImages?: number;
  theme?: string;
}

const ImagesReview: React.FC<Props> = ({
  images = [],
  onDeleteImage,
  allowDelete = false,
  visibleImages = 3,

}) => {
  const { confirm } = useConfirmation();
  const [zoomedImage, setZoomedImage] = useState<ImageItem | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const imagesCount = images.length;
  
  const displayedImages = (() => {
    if (imagesCount <= visibleImages) return images;
    return Array.from({ length: visibleImages }).map((_, i) => images[(carouselIndex + i) % imagesCount]);
  })();

  const handlePrev = () => setCarouselIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
  const handleNext = () => setCarouselIndex((prev) => (prev + 1) % imagesCount);

  const handleDeleteImage = async (img: ImageItem) => {
    if (!onDeleteImage) return;
    
    const result = await confirm({
      title: "Delete Image",
      description: "Are you sure you want to delete this image?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (result && img.url) {
      onDeleteImage(img.url);
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No images to display
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-col items-center">
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
            <div key={img.id || `img-${idx}`} className="group relative">
              <Image
                src={img.url}
                alt={`Image ${idx + 1}`}
                width={150}
                height={110}
                className="cursor-pointer rounded border border-gray-300 object-cover shadow"
                style={{ minWidth: 150, minHeight: 110, maxHeight: 110, maxWidth: 150 }}
                onClick={() => setZoomedImage(img)}
              />
              {allowDelete && (
                <button
                  type="button"
                  className="absolute right-1 top-1 z-10 rounded-full bg-white/80 p-1 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => handleDeleteImage(img)}
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

export default ImagesReview;