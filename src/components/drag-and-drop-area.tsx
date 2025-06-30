"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React, { useCallback, useRef } from "react";
import { useController, useFormContext } from "react-hook-form";

interface Props {
  name: string;
  previewUrls: string[];
  onPreviewUrlsChange: (urls: string[]) => void;
  theme?: string;
}

const DragAndDropArea: React.FC<Props> = ({
  name,
  previewUrls,
  onPreviewUrlsChange,
  theme
}) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const currentFiles = field.value instanceof FileList
      ? Array.from(field.value)
      : field.value || [];

    const combinedFiles = [...currentFiles, ...newFiles].slice(0, 10);
    field.onChange(combinedFiles);

    const urls = combinedFiles.map((file) => URL.createObjectURL(file));
    onPreviewUrlsChange(urls);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDelete = (index: number) => {
    const newFiles = [...field.value];
    newFiles.splice(index, 1);

    const newUrls = [...previewUrls];
    newUrls.splice(index, 1);

    field.onChange(newFiles);
    onPreviewUrlsChange(newUrls);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
      className={cn("cursor-pointer rounded border border-dashed border-gray-400 bg-[#00000039] p-4 text-center",{
                      "text-gray-300": theme === Theme.LIGHT,
                      "text-zinc-400": theme === Theme.DARK,
      })}
    >
      <p className="text-sm">
        Drag and drop images here or click to browse (max 10)
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {previewUrls.length > 0 && (
        <div className="mt-4 w-full max-w-[700px] overflow-x-auto">
          <div className="flex w-max gap-4 pb-2">
            {previewUrls.map((src, idx) => (
              <div key={idx} className="relative h-[150px] w-[150px] flex-shrink-0">
                <Image
                  src={src}
                  alt={`Preview ${idx}`}
                  fill
                  className="rounded object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(idx);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500 shadow transition hover:bg-red-500 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DragAndDropArea;
