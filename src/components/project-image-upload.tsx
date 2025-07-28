"use client";
import React, { useState } from "react";
import ImagesReview from "./images-review";
import ImagesUpload from "./images-upload";

type ProjectImage = { id?: string; url: string };

interface Props {
  mode: "create" | "view" | "edit";
  theme?: string;
  existingImages?: ProjectImage[];
  onImagesChange?: (files: File[]) => void;
  onRemoveImage?: (url: string) => void;
  maxImages?: number;
  allowEdit?: boolean;
}

const ProjectImageUpload: React.FC<Props> = ({
  mode,
  theme,
  existingImages = [],
  onImagesChange,
  onRemoveImage,
  maxImages = 10,
  allowEdit = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditComplete = () => {
    setIsEditing(false);
  };

  const handleImagesChange = (files: File[]) => {
    console.log("ProjectImageUpload: handleImagesChange called with", files.length, "files");
    if (onImagesChange) {
      onImagesChange(files);
    }
  };
  
  const handleRemoveImage = (url: string) => {
    console.log("ProjectImageUpload: handleRemoveImage called for", url);
    if (onRemoveImage) {
      onRemoveImage(url);
    }
  };

  return (
    <div className="space-y-4">
      {existingImages.length > 0 && (
        <ImagesReview
          images={existingImages}
          onDeleteImage={isEditing ? handleRemoveImage : undefined}
          allowDelete={isEditing}
          visibleImages={3}
          theme={theme}
        />
      )}

      {(mode === "create" || (mode === "edit" && allowEdit)) && (
        <ImagesUpload
          mode={mode}
          theme={theme}
          onImagesChange={handleImagesChange} 
          maxImages={maxImages}
          currentCount={existingImages.length}
          title="Newly Added Images"
          description="Add images to showcase your project"
          onEditStart={handleEditStart}
          onEditComplete={handleEditComplete}
          editingActive={isEditing}
        />
      )}
    </div>
  );
};

export default ProjectImageUpload;
