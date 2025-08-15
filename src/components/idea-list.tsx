"use client";

import React from "react";
import { useModalContext } from "@/context/modal-context";
import { cn } from "@/utils/cn.utils";
import { Idea } from "@/models/idea.types";
import IdeaCard from "@/components/PAGE-create-idea/idea-card";

interface Props {
  ideas: Idea[];
  loading: boolean;
}

const IdeaList: React.FC<Props> = ({ ideas, loading }) => {
  const { isInModal } = useModalContext();

  return (
    <div className={cn("space-y-6 px-2", isInModal ? "h-full overflow-y-auto" : "max-h-[600px] overflow-y-auto")}>
      {loading ? (
        <p className="text-center">Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <p className="text-center">No ideas found.</p>
      ) : (
        ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
      )}
    </div>
  );
};

export default IdeaList;