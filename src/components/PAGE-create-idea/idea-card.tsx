"use client";
import { Idea } from "@/models/idea";
import React, { useEffect, useState } from "react";

interface Props {
  idea: Idea;
}

// const what3wordsApiKey = process.env.NEXT_PUBLIC_W3W_API_KEY;

const IdeaCard: React.FC<Props> = ({ idea }) => {
  const [showComments, setShowComments] = useState(false);
  const [collabStatus, setCollabStatus] = useState(idea.collaborators?.[0]?.status ?? null);
  const [displayAddress, setDisplayAddress] = useState<string | null>(idea.postcode ?? null);

  // Fetch postcode/address if not provided, but w3w or coords exist
  useEffect(() => {
    if (idea.postcode) {
      setDisplayAddress(idea.postcode);
      return;
    }
    const fetchAddress = async () => {
      try {
        // if (idea.what3words && !idea.postcode) {
        //   // Get coords from w3w, then fetch address/postcode
        //   const w3wRes = await fetch(
        //     `https://api.what3words.com/v3/convert-to-coordinates?words=${idea.what3words}&key=${what3wordsApiKey}`
        //   );
        //   const w3wData = await w3wRes.json();
        //   if (w3wData.coordinates) {
        //     const { lat, lng } = w3wData.coordinates;
        //     // Get postcode from coords (using UK postcodes.io, or fallback)
        //     const postRes = await fetch(`https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}`);
        //     const postData = await postRes.json();
        //     const postcode = postData.result?.[0]?.postcode;
        //     if (postcode) setDisplayAddress(postcode);
        //     else setDisplayAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        //   }
        // } 
         if (idea.latitude && idea.longitude) {
          // No w3w, but have coords
          const postRes = await fetch(`https://api.postcodes.io/postcodes?lon=${idea.longitude}&lat=${idea.latitude}`);
          const postData = await postRes.json();
          const postcode = postData.result?.[0]?.postcode;
          if (postcode) setDisplayAddress(postcode);
          else setDisplayAddress(`${idea.latitude.toFixed(5)}, ${idea.longitude.toFixed(5)}`);
        }
      } catch (err) {
        setDisplayAddress(null);
        console.log(err)
      }
    };
    fetchAddress();
  }, [idea.postcode, idea.what3words, idea.latitude, idea.longitude]);

  const requestCollab = async () => {
    const res = await fetch(`/api/ideas/${idea.id}/collaborate`, { method: "POST" });
    if (res.ok) setCollabStatus("PENDING");
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-5 shadow">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">{idea.title}</span>
        {displayAddress && (
          <span className="text-xs text-gray-600 ml-2">({displayAddress})</span>
        )}
        {idea.allowCollab && (
          <span className="rounded bg-blue-100 px-2 text-xs text-blue-800">Collaboration Open</span>
        )}
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
        <button className="rounded bg-blue-50 px-3 py-1 hover:bg-blue-100" onClick={() => setShowComments((c) => !c)}>
          {showComments ? "Hide" : "Show"} Comments
        </button>
        {idea.allowCollab && !idea.isConverted && !collabStatus && (
          <button className="rounded bg-orange-50 px-3 py-1 hover:bg-orange-100" onClick={requestCollab}>
            Request Collaboration
          </button>
        )}
        {collabStatus && <span className="text-xs">Collab: {collabStatus}</span>}
        {idea.isConverted && (
          <a href={`/projects/${idea.projectId}`} className="ml-auto text-green-600 underline">
            View Project
          </a>
        )}
      </div>
      {showComments && (
        <div className="mt-2 rounded bg-gray-50 p-3">
          {/* Map comments, add new comment form, etc. */}
          <div className="text-sm text-gray-500">Comments feature goes here...</div>
        </div>
      )}
    </div>
  );
};

export default IdeaCard;
