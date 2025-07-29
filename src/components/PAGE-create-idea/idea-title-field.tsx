import {} from "@/context/safe-theme-context";
import { useFormContext } from "react-hook-form";

import RequiredStar from "../required-star";
import IconWithTooltip from "../icon-with-tooltip";

interface IdeaTitleFieldProps {
  theme: string;
}

const IdeaTitleField: React.FC<IdeaTitleFieldProps> = ({ theme }) => {
  const { register } = useFormContext();

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-semibold">
          Idea Title
          <RequiredStar />
        </label>
        <IconWithTooltip
          theme={theme}
          id="title"
          tooltipPlacement="left"
          content="A short, descriptive title for your idea. E.g. 'New Playground in Riverside Park'."
        />
      </div>
      <input
        className="w-full rounded border p-2"
        placeholder="Idea title"
        {...register("title", { required: true })}
      />
    </div>
  );
};

export default IdeaTitleField;
