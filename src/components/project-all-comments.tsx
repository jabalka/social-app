"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthUser } from "@/models/auth";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
// import UserDetailsDialog from "./user-details";
import UserInteractionDialog from "./user-interaction-dialog";

interface CommentType {
  id: string;
  content: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  likes: { userId: string }[];
  replies: CommentType[];
  createdAt: string;
  parentId?: string | null;
}

interface ProjectAllCommentsProps {
  projectId: string;
  user: AuthUser;
  open: boolean;
  onClose: () => void;
  theme: string;
}

const ProjectAllComments: React.FC<ProjectAllCommentsProps> = ({ projectId, user, open, onClose, theme }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const pageSize = 10;

  const fetchComments = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/comment?page=${pageNum}&pageSize=${pageSize}`);
      const data = await res.json();
      setComments((prev) => [...prev, ...data.comments]);
      setHasMore(data.hasMore);
      setLoading(false);
    },
    [projectId],
  );

  useEffect(() => {
    if (open) {
      setComments([]);
      setPage(1);
      fetchComments(1);
    }
  }, [open, fetchComments]);

  useEffect(() => {
    if (page > 1) fetchComments(page);
  }, [page, fetchComments]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 },
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, loading]);

  const handleLike = async (commentId: string) => {
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: c.likes.some((l) => l.userId === user.id)
                ? c.likes.filter((l) => l.userId !== user.id)
                : [...c.likes, { userId: user.id }],
            }
          : c,
      ),
    );
  };

  const handleReply = async (parentId: string) => {
    const content = replyContent[parentId]?.trim();
    if (!content) return;
    const res = await fetch(`/api/projects/${projectId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => prev.map((c) => (c.id === parentId ? { ...c, replies: [...c.replies, newComment] } : c)));
      setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
    }
  };

  const openUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserDialogOpen(true);
  };

  const renderComment = (comment: CommentType, depth = 0) => (
    <div key={comment.id} className={cn("mb-4", { "ml-6": depth > 0 })}>
      <div className="flex items-start gap-3">
        {comment.author?.image ? (
          <Image
            src={comment.author.image}
            alt="Profile Picture"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-400" />
        )}
        <div className="flex-1">
          <div className="text-sm font-semibold">
            <button onClick={() => openUserDetails(comment.author.id)} className="text-blue-600 hover:underline">
              {comment.author?.name || comment.author?.email || "Unknown User"}
            </button>
          </div>
          <div className="text-sm">{comment.content}</div>
          <div className="mt-1 flex gap-2 text-xs text-gray-500">
            <button onClick={() => handleLike(comment.id)}>
              ❤️ {comment.likes.length} {comment.likes.some((l) => l.userId === user.id) ? "(Liked)" : ""}
            </button>
          </div>
          <div className="mt-2">
            <textarea
              rows={2}
              className="w-full rounded border p-1 text-sm"
              placeholder="Reply..."
              value={replyContent[comment.id] || ""}
              onChange={(e) => setReplyContent((prev) => ({ ...prev, [comment.id]: e.target.value }))}
            />
            <button
              onClick={() => handleReply(comment.id)}
              className="mt-1 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className={cn("max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6", {
            "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
            "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
          })}
        >
          <DialogHeader>
            <DialogTitle>All Comments</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {comments.length === 0 && !loading && <p className="text-center text-sm text-gray-500">No comments yet.</p>}
            {comments.map((comment) => renderComment(comment))}
            <div ref={observerRef} />
            {loading && (
              <div className="text-center">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="inline h-14 w-14 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <UserInteractionDialog
  userId={selectedUserId}
  open={isUserDialogOpen}
  onClose={() => {
    setIsUserDialogOpen(false)
    setSelectedUserId(null)}
  }
  currentUser={user}
/>
    </>
  );
};

export default ProjectAllComments;
