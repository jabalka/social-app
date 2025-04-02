// hooks/usePosts.ts
import { useState, useEffect } from 'react';
import { getPaginatedPosts, PostWithDetails } from '@/lib/posts';

export function usePosts(initialPage = 1, limit = 10) {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { posts: newPosts, total } = await getPaginatedPosts(page, limit);
      setPosts(newPosts);
      setTotal(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const nextPage = () => setPage(p => Math.min(p + 1, Math.ceil(total / limit)));
  const prevPage = () => setPage(p => Math.max(p - 1, 1));

  return {
    posts,
    loading,
    error,
    page,
    totalPages: Math.ceil(total / limit),
    nextPage,
    prevPage,
    goToPage: setPage,
    refresh: fetchPosts
  };
}