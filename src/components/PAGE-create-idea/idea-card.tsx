"use client";

import { useSocketContext } from "@/context/socket-context";
import { Idea } from "@/models/idea.types";
import { cn } from "@/utils/cn.utils";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

interface Props {
  idea: Idea;

  // selection
  selected?: boolean;
  onSelect?: () => void;
}

const IdeaCard: React.FC<Props> = ({ idea, selected, onSelect }) => {
  const { data: session } = useSession();
  const myCollab = idea.collaborators?.find((c) => c.userId === session?.user?.id);
  const [collabId, setCollabId] = useState<string | null>(myCollab?.id ?? null);

  const [showComments, setShowComments] = useState(false);
  const [collabStatus, setCollabStatus] = useState((idea.collaborators?.[0]?.status ?? null) || null);
  const [displayAddress, setDisplayAddress] = useState<string | null>(idea.postcode ?? null);
  const { socket } = useSocketContext();

  // Fetch postcode/address if not provided, but coordinates exist
  useEffect(() => {
    if (idea.postcode) {
      setDisplayAddress(idea.postcode);
      return;
    }
    const fetchAddress = async () => {
      try {
        if (idea.latitude && idea.longitude) {
          const postRes = await fetch(`https://api.postcodes.io/postcodes?lon=${idea.longitude}&lat=${idea.latitude}`);
          const postData = await postRes.json();
          const postcode = postData.result?.[0]?.postcode;
          if (postcode) setDisplayAddress(postcode);
          else setDisplayAddress(`${idea.latitude.toFixed(5)}, ${idea.longitude.toFixed(5)}`);
        }
      } catch (err) {
        setDisplayAddress(null);
        console.log(err);
      }
    };
    fetchAddress();
  }, [idea.postcode, idea.latitude, idea.longitude, idea.what3words]);

  const requestCollab = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/ideas/${idea.id}/collaborate`, { method: "POST" });
    if (res.ok) {
      setCollabStatus("PENDING");
      const data = await res.json();
      const collab = data.data;

      setCollabId(collab.id);
      socket?.emit("idea:collab-request", { ideaId: idea.id, requestId: collab.id });
    }
  };

  const cancelCollab = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/ideas/${idea.id}/collaborate/${collabId}`, { method: "DELETE" });
    if (res.ok) {
      setCollabId(null);
    }
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments((c) => !c);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.()}
      className={cn(
        "flex flex-col gap-2 rounded-xl p-5 shadow transition",
        "hover:border-sky-400/60 hover:shadow-md",
        selected ? "border bg-white ring-2 ring-sky-500/70" : "border bg-white ring-0",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">{idea.title}</span>
        {displayAddress && <span className="ml-2 text-xs text-gray-600">({displayAddress})</span>}
        {idea.allowCollab && <span className="rounded bg-blue-100 px-2 text-xs text-blue-800">Collaboration Open</span>}
        {idea.isConverted && (
          <span className="rounded bg-green-100 px-2 text-xs text-green-800">Converted to Project</span>
        )}
      </div>
      <p className="text-gray-700">{idea.content}</p>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>By {idea.author?.name || "Anonymous"}</span>
        <span>· {new Date(idea.createdAt).toLocaleDateString()}</span>
        <span>· {idea.likes?.length ?? 0} likes</span>
        <span>· {idea.comments?.length ?? 0} comments</span>
      </div>
      <div className="mt-2 flex gap-2">
        <button className="rounded bg-blue-50 px-3 py-1 hover:bg-blue-100" onClick={toggleComments}>
          {showComments ? "Hide" : "Show"} Comments
        </button>
        {idea.allowCollab && !idea.isConverted && !collabId && (
          <button className="rounded bg-orange-50 px-3 py-1 hover:bg-orange-100" onClick={requestCollab}>
            Request Collaboration
          </button>
        )}
        {collabStatus === "PENDING" && collabId && (
          <button className="rounded bg-red-50 px-3 py-1 hover:bg-red-100" onClick={cancelCollab}>
            Cancel Collaboration
          </button>
        )}
        {collabStatus && <span className="text-xs">Collab: {collabStatus}</span>}
        {idea.isConverted && (
          <a
            href={`/projects/${idea.projectId}`}
            className="ml-auto text-green-600 underline"
            onClick={(e) => e.stopPropagation()}
          >
            View Project
          </a>
        )}
      </div>
      {showComments && (
        <div className="mt-2 rounded bg-gray-50 p-3" onClick={(e) => e.stopPropagation()}>
          <div className="text-sm text-gray-500">Comments feature goes here...</div>
        </div>
      )}
    </div>
  );
};

export default IdeaCard;
