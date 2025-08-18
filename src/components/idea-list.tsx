"use client";

import IdeaCard from "@/components/PAGE-create-idea/idea-card";
import { useModalContext } from "@/context/modal-context";
import { Idea } from "@/models/idea.types";
import { cn } from "@/utils/cn.utils";
import React from "react";

interface Props {
  ideas: Idea[];
  loading: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const IdeaList: React.FC<Props> = ({ ideas, loading, selectedId, onSelect }) => {
  const { isInModal } = useModalContext();

  return (
    <div className={cn("space-y-6 px-2", isInModal ? "h-full overflow-y-auto nf-scrollbar" : "max-h-[600px] overflow-y-auto nf-scrollbar")}>
      {loading ? (
        <p className="text-center">Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <p className="text-center">No ideas found.</p>
      ) : (
        ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            // selection
            selected={selectedId === idea.id}
            onSelect={() => onSelect?.(idea.id)}
          />
        ))
      )}
    </div>
  );
};

export default IdeaList;
