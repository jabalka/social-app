import React, { useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import IconWithTooltip from "../icon-with-tooltip";
import ImagesUpload from "../images-upload";


interface IdeaImageUploadProps {
  theme: string;
  previewUrls: string[];
  onPreviewUrlsChange: (urls: string[]) => void;
}

const IdeaImageUpload: React.FC<IdeaImageUploadProps> = ({ 
  theme, 
  onPreviewUrlsChange 
}) => {
  const { control } = useFormContext();

  const handleImagesChange = useCallback((files: File[]) => {
    // Generate preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    onPreviewUrlsChange(urls);
  }, [onPreviewUrlsChange]);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">Idea Images</label>
        <IconWithTooltip
          theme={theme}
          tooltipPlacement="left"
          id="images"
          content="Attach up to 10 images that help explain your idea. Drag and drop or click to browse."
        />
      </div>
      <Controller
        name="images"
        control={control}
        render={({ field }) => (
          <ImagesUpload
            mode="create"
            theme={theme}
            onImagesChange={(files) => {
              field.onChange(files);
              handleImagesChange(files);
            }}
            maxImages={10}
            currentCount={0}
            title=""
            description=""
          />
        )}
      />
    </div>
  );
};

export default IdeaImageUpload;