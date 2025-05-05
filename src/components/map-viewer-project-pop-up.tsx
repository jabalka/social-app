"use client";

import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { User } from "next-auth";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import CommentCreation from "./create-comment";

interface ProjectPopupContentProps {
  user: User;
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  progress: number;
  categories: {
    id: string;
    name: string;
    icon: string;
  }[];
  images: {
    id: string;
    url: string;
    projectId: string;
    createdAt: Date;
  }[];
  likes: {
    id: string;
    userId: string;
    createdAt: Date;
  }[];
  comments: {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

const ProjectPopupContent: React.FC<ProjectPopupContentProps> = ({
  user,
  id,
  title,
  images,
  progress,
  categories,
  comments,
}) => {
  const [likes, setLikes] = useState<{ id: string; userId: string; createdAt: Date }[]>([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [animationKey, setAnimationKey] = useState<number>(0);

  const fetchLikes = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/like`);
      if (res.ok) {
        const data = await res.json();
        setLikes(data);
      }
    } catch (err) {
      console.error("Failed to fetch likes:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchLikes();

    const interval = setInterval(fetchLikes, 60000);
    return () => clearInterval(interval);
  }, [fetchLikes]);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  const alreadyLiked = likes.some((like) => like.userId === user.id);

  const handleLike = async () => {
    setAnimationKey(Date.now());
    if (!user.id || isLiking) return;
    setIsLiking(true);

    try {
      const res = await fetch(`/api/projects/${id}/like`, { method: "POST" });
      if (res.ok) {
        await fetchLikes();
      } else {
        console.error("Failed to like project");
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="rounded border p-4">
      <h2 className="mb-1 text-lg font-bold">{title}</h2>

      {images.length > 0 && (
        <div className="mb-3 flex justify-center">
          <Image
            src={images[0].url}
            alt={`${title} preview`}
            width={124}
            height={32}
            className="rounded object-cover"
          />
        </div>
      )}

      {/* Category Icons */}
      <div className="mt-2 flex gap-2">
        {categories.map(({ id, name }) => {
          const matched = PROJECT_CATEGORIES.find((cat) => cat.id === id);
          const Icon = matched?.icon;

          return (
            Icon && (
              <div key={id} className="group relative flex items-center justify-center">
                <Icon className="h-5 w-5 text-gray-700 group-hover:text-blue-500" />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                  {name}
                </div>
              </div>
            )
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">{progress}% complete</p>

      {/* CTA */}
      <button className="mt-2 w-full rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
        View Details
      </button>

      {/* Action Buttons */}
      <div className="mt-3 flex justify-between gap-2">
        <div className="relative inline-flex">
          <button
            onClick={handleLike}
            className={`rounded px-3 py-1 text-sm text-white ${
              alreadyLiked ? "bg-green-700 hover:bg-green-900" : "bg-pink-700 hover:bg-pink-900"
            }`}
          >
            {alreadyLiked ? "Liked" : "Like"} ({likes.length})
            {animationKey > 0 && (
              <span
                key={animationKey}
                className="animate-snakeBorder pointer-events-none absolute -inset-[2px] overflow-hidden rounded-lg"
              />
            )}
          </button>
        </div>
        <button
          onClick={() => setShowCommentModal(true)}
          className="rounded bg-purple-500 px-3 py-1 text-sm text-white hover:bg-purple-600"
        >
          Comments ({comments.length})
        </button>
      </div>

      {/* Comment Modal */}
      {showCommentModal && <CommentCreation user={user} projectId={id} onClose={() => setShowCommentModal(false)} />}
    </div>
  );
};

export default ProjectPopupContent;
