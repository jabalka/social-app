import React from "react";
import { useFormContext } from "react-hook-form";
import RequiredStar from "./required-star";
import IconWithTooltip from "./tooltip-with-icon";

interface ProjectTitleFieldProps {
  theme: string;
}

const ProjectTitleField: React.FC<ProjectTitleFieldProps> = ({ theme }) => {
  const { register } = useFormContext();

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">
          Project Title
          <RequiredStar />
        </label>
        <IconWithTooltip
          theme={theme}
          id="title"
          tooltipPlacement="left"
          content="A short, descriptive title for your project."
        />
      </div>
      <input
        className="w-full rounded border p-2"
        placeholder="Project title"
        {...register("title", { required: true })}
      />
    </div>
  );
};

export default ProjectTitleField;
