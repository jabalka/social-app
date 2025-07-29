"use client";
import IconWithTooltip from "@/components/icon-with-tooltip";
import { USER_ROLES } from "@/lib/user-roles";
import React from "react";

interface Props {
  roleId: string;
  theme: string;
}

const ProfileRoleDisplay: React.FC<Props> = ({ roleId, theme }) => {
  const matchedRole = USER_ROLES.find((r) => r.id === roleId);

  return (
    <div className="relative flex flex-row gap-1 md:items-center md:gap-2">
      <label className="text-sm font-medium">Your Role:</label>

      {matchedRole && (
        <IconWithTooltip
          id="your-role"
          theme={theme}
          icon={matchedRole?.icon}
          iconClassName="h-7 w-7"
          content={matchedRole?.name}
        />
      )}

      <IconWithTooltip
        id="info-roles"
        theme={theme}
        iconClassName="h-4 w-4"
        tooltipPlacement="left"
        content={
          <>
            <p className="mb-1 font-semibold">{matchedRole?.name} – your assigned role.</p>
            <p className="mb-1">Other roles:</p>
            <ul className="ml-6 list-disc">
              {USER_ROLES.filter((r) => r.id !== matchedRole?.id).map((r) => (
                <li key={r.id}>
                  {r.name} <r.icon />
                </li>
              ))}
            </ul>
          </>
        }
      />
    </div>
  );
};

export default ProfileRoleDisplay;
