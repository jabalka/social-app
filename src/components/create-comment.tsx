"use client";

import { User } from "next-auth";
import { useState } from "react";

interface CommentModalProps {
  user: User;
  projectId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

const CommentCreation: React.FC<CommentModalProps> = ({ user, projectId, onClose, onCommentAdded }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id || !content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, projectId }),
      });

      if (res.ok) {
        setContent("");
        onCommentAdded?.();
        onClose();
      } else {
        console.error("Failed to submit comment");
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold">Leave a Comment</h3>
        <textarea
          className="w-full rounded border p-2"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 text-sm text-gray-600 hover:underline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentCreation;
