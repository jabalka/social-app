// hooks/useComments.ts
import { useState, useEffect } from 'react';
import { getPaginatedComments, CommentWithAuthor } from '@/lib/comments';

export function useComments(postId: string, initialPage = 1, limit = 10) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { comments: newComments, total } = await getPaginatedComments(postId, page, limit);
      setComments(newComments);
      setTotal(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, page]);

  const nextPage = () => setPage(p => Math.min(p + 1, Math.ceil(total / limit)));
  const prevPage = () => setPage(p => Math.max(p - 1, 1));

  return {
    comments,
    loading,
    error,
    page,
    totalPages: Math.ceil(total / limit),
    nextPage,
    prevPage,
    goToPage: setPage,
    refresh: fetchComments
  };
}