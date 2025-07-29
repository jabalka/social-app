import React from "react";
import { useFormContext } from "react-hook-form";
import IconWithTooltip from "../icon-with-tooltip";

interface CollaborationCheckboxProps {
  theme: string;
}

const CollaborationCheckbox: React.FC<CollaborationCheckboxProps> = ({ theme }) => {
  const { register } = useFormContext();

  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" {...register("allowCollab")} />
      Allow collaboration requests
      <IconWithTooltip
        theme={theme}
        tooltipPlacement="left"
        id="collab"
        content="If enabled, others can request to join and help with your idea."
      />
    </label>
  );
};

export default CollaborationCheckbox;
