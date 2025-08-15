"use client";

import { Idea } from "@/models/idea.types";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React from "react";

interface Props {
  idea: Idea;
  onClose: () => void;
  theme: string;
}

const IdeaPopupCard: React.FC<Props> = ({ idea, onClose, theme }) => {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl border p-4 shadow-xl",
        theme === Theme.DARK
          ? "border-zinc-700 bg-zinc-900 text-zinc-100"
          : "border-zinc-300 bg-white text-zinc-800"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{idea.title}</h3>
        <button
          onClick={onClose}
          className={cn(
            "rounded px-2 py-1 text-sm",
            theme === Theme.DARK ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-100 hover:bg-zinc-200"
          )}
        >
          Close
        </button>
      </div>
      {idea.postcode && <div className="text-xs opacity-70 mb-1">{idea.postcode}</div>}
      <p className="text-sm">{idea.content}</p>
      <div className="mt-3 flex gap-3 text-xs opacity-80">
        <span>👍 {idea.likes?.length ?? 0}</span>
        <span>💬 {idea.comments?.length ?? 0}</span>
      </div>
      {idea.isConverted && idea.projectId && (
        <a
          href={`/projects/${idea.projectId}`}
          className={cn(
            "mt-3 inline-block rounded px-3 py-1 text-sm underline",
            theme === Theme.DARK ? "bg-zinc-800" : "bg-zinc-100"
          )}
        >
          View Project
        </a>
      )}
    </div>
  );
};

export default IdeaPopupCard;