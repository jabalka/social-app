"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {  useUserDialog } from "@/context/user-dialog-context";
import { AuthUser } from "@/models/auth.types";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Loader from "./common/loader";
import { useSocketContext } from "@/context/socket-context";
// import UserDetailsDialog from "./user-details";
// import UserInteractionDialog from "./user-interaction-dialog";

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
  const { setSelectedUserId, setIsOpen } = useUserDialog();
  const { socket } = useSocketContext();

  const [comments, setComments] = useState<CommentType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
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
    socket?.emit("comment:like", { commentId, userId: user.id, projectId });
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
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: [
                  // filter out any reply with the same id before adding
                  ...c.replies.filter((r) => r.id !== newComment.id),
                  newComment,
                ],
              }
            : c
        )
      );
      setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
      socket?.emit("comment:reply", {
        parentId,
        commentId: newComment.id,
        projectId,
        userId: user.id,
      });
    }
  };

  const openUserDetails = (selectedUserId: string) => {
    setSelectedUserId(selectedUserId);
    setIsOpen(true);
  };

  const renderComment = (comment: CommentType, depth = 0) => (
    <div key={`comment-${comment.id}`} className={cn("mb-4", { "ml-6": depth > 0 })}>
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
            <button onClick={() => {
              console.log("project-all-comments ln142., button WORKS!")
              openUserDetails(comment.author.id)}
              } className="text-blue-600 hover:underline">
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

  function dedupeComments(comments: CommentType[]): CommentType[] {
    const seen = new Set<string>();
    return comments.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      // Also dedupe replies recursively
      if (c.replies) c.replies = dedupeComments(c.replies);
      return true;
    });
  }

  return (
    <>

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className={cn("max-h-[90vh] w-full max-w-2xl overflow-y-auto nf-scrollbar p-6", {
            "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
            "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
          })}
        >
          <DialogHeader>
            <DialogTitle>All Comments</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {comments.length === 0 && !loading && <p className="text-center text-sm text-gray-500">No comments yet.</p>}
            {dedupeComments(comments).map((comment) => renderComment(comment))}
            <div ref={observerRef} />
            {loading && (<Loader />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* <UserInteractionDialog
        open={setIsUserDialogOpen(true)}
        userId={selectedUserId}
        onClose={() => {
          setIsUserDialogOpen(false);
          setSelectedUserId(null);
        }}
        currentUser={user}
      /> */}

    </>
  );
};

export default ProjectAllComments;
