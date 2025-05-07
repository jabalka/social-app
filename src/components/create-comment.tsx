"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { User } from "next-auth";
import { useState } from "react";
import { Button } from "./ui/button";

interface CommentModalProps {
  user: User;
  projectId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
  theme: string
}

const CommentCreation: React.FC<CommentModalProps> = ({ user, projectId, onClose, onCommentAdded, theme }) => {
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
      <div className={cn("w-full max-w-md rounded-lg p-4 shadow-lg", {
                      "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
                      "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
      })}>
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
          <Button
   
        className={cn("rounded-full px-8 py-3 font-bold transition duration-300 hover:outline hover:outline-2", {
          "bg-gradient-to-br from-[#f3cdbd] via-[#d3a18c] to-[#bcaca5] text-zinc-700 hover:bg-gradient-to-br hover:from-[#b79789] hover:via-[#ddbeb1] hover:to-[#92817a] hover:text-zinc-50 hover:outline-gray-200":
            theme === Theme.LIGHT,
          "bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#bda69c] text-zinc-100 hover:bg-gradient-to-br hover:from-[#ff6913]/50 hover:via-white/20 hover:to-[#ff6913]/60 hover:text-gray-600 hover:outline-gray-700":
            theme === Theme.DARK,
        })}
     onClick={handleSubmit}
     disabled={loading}
      >
              {loading ? "Posting..." : "Post Comment"}
      </Button>

        </div>
      </div>
    </div>
  );
};

export default CommentCreation;
