import { useSocketContext } from "@/context/socket-context";
import { AuthUser } from "@/models/auth.types";
import { Project } from "@/models/project.types";
import { useCallback, useEffect, useState } from "react";
import GlowingPinkButton from "./glowing-pink-button";
import GlowingGreenButton from "./glowing-green-button";
import GlowingVioletButton from "./glowing-violet-button";


// Props from social section (lines 750-784)
interface ProjectSocialProps {
  project: Project;
  user: AuthUser;
  theme?: string;
  setShowCommentModal: (show: boolean) => void;
  setShowAllComments: (show: boolean) => void;
}

const ProjectSocial = ({
  project,
  user,
  theme,
  setShowCommentModal,
  setShowAllComments
}: ProjectSocialProps) => {
  const { socket } = useSocketContext();
  const [likes, setLikes] = useState(project.likes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [animationKey, setAnimationKey] = useState<number>(0);

  // From lines 130-139
  const fetchLikes = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/like`);
      if (res.ok) {
        const data = await res.json();
        setLikes(data);
      }
    } catch (err) {
      console.error("Failed to fetch likes:", err);
    }
  }, [project.id]);

  // From lines 141-145
  useEffect(() => {
    if (animationKey === 0) return;
    const timeout = setTimeout(() => setAnimationKey(0), 3000);
    return () => clearTimeout(timeout);
  }, [animationKey]);

  // From line 147
  useEffect(() => setLikes(project.likes || []), [project.likes]);

  // From lines 149-153
  useEffect(() => {
    fetchLikes();
    const interval = setInterval(fetchLikes, 60000);
    return () => clearInterval(interval);
  }, [fetchLikes]);

  // From lines 243-272
  const handleLike = async () => {
    setAnimationKey(Date.now());
    if (!user.id || isLiking) return;
    setIsLiking(true);

    try {
      socket?.emit("project:like", { projectId: project.id, userId: user.id });
      const alreadyLiked = likes.some((like) => like.userId === user.id);
      let newLikes;
      if (alreadyLiked) {
        newLikes = likes.filter((like) => like.userId !== user.id);
      } else {
        newLikes = [
          ...likes,
          {
            id: `optimistic-${user.id}-${Date.now()}`,
            userId: user.id,
            createdAt: new Date(),
          },
        ];
      }
      setLikes(newLikes);

      const res = await fetch(`/api/projects/${project.id}/like`, {
        method: "POST",
      });
      if (res.ok) {
        fetchLikes();
      } else {
        setLikes(likes);
        console.error("Failed to like project");
      }
    } catch (err) {
      setLikes(likes);
      console.error("Like error:", err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="mt-8 flex justify-between gap-2">
      <div className="relative flex flex-col items-center">
        <span className="mb-1 text-sm">({likes.length}) Likes</span>
        <div className="relative inline-flex overflow-hidden rounded-full p-[4px]">
          {likes.some((like) => like.userId === user.id) ? (
            <GlowingPinkButton onClick={handleLike} className="w-32" disabled={isLiking}>
              Liked
            </GlowingPinkButton>
          ) : (
            <GlowingGreenButton onClick={handleLike} className="w-32" disabled={isLiking}>
              Like
            </GlowingGreenButton>
          )}
        </div>
      </div>
      <div className="relative flex flex-col items-center">
        <div className="mb-1 flex items-center gap-1 text-sm">
          ({project.comments.length})
          <button
            onClick={() => setShowAllComments(true)}
            className="text-xs text-blue-400 underline hover:text-blue-300"
          >
            All Comments
          </button>
        </div>
        <GlowingVioletButton onClick={() => setShowCommentModal(true)} className="w-32">
          Comment
        </GlowingVioletButton>
      </div>
    </div>
  );
};

export default ProjectSocial;