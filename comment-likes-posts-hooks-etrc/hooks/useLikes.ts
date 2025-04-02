// hooks/useLikes.ts
import { useState } from 'react';
import prisma from '@/lib/prisma';

export function useLikes(postId: string, userId?: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check initial like status
  useEffect(() => {
    const checkLike = async () => {
      if (!userId) return;
      
      const [count, userLike] = await Promise.all([
        prisma.like.count({ where: { postId } }),
        prisma.like.findUnique({
          where: { postId_userId: { postId, userId } }
        })
      ]);
      
      setLikeCount(count);
      setIsLiked(!!userLike);
    };
    
    checkLike();
  }, [postId, userId]);

  const toggleLike = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      if (isLiked) {
        await prisma.like.delete({
          where: { postId_userId: { postId, userId } }
        });
        setLikeCount(c => c - 1);
      } else {
        await prisma.like.create({
          data: { postId, userId }
        });
        setLikeCount(c => c + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isLiked, likeCount, toggleLike, loading };
}