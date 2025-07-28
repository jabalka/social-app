import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React, { useCallback, useRef } from "react";

interface DragAndDropCustomProps {
  onFilesSelected: (files: File[]) => void;
  theme?: string;
  maxImages?: number;
  currentCount?: number;
}

const DragAndDropCustom: React.FC<DragAndDropCustomProps> = ({
  onFilesSelected,
  theme = Theme.LIGHT,
  maxImages = 10,
  currentCount = 0,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files);
      onFilesSelected(newFiles);
    },
    [onFilesSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (e.target) e.target.value = ""; // Reset input
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
      className={cn("cursor-pointer rounded border border-dashed border-gray-400 bg-[#00000039] p-4 text-center", {
        "text-gray-300": theme === Theme.LIGHT,
        "text-zinc-400": theme === Theme.DARK,
      })}
    >
      <p className="text-sm">
        Drag and drop images here or click to browse ({currentCount} of {maxImages})
      </p>
      <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleInputChange} className="hidden" />
    </div>
  );
};

export default DragAndDropCustom;
