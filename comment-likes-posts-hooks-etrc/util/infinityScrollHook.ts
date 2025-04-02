// hooks/useInfiniteScroll.ts
import { getPaginatedPosts } from "@/lib/posts";
import { useEffect, useState } from "react";

export function useInfiniteScroll(initialLimit = 10) {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const { posts: newPosts } = await getPaginatedPosts(page, initialLimit);
      setPosts((prev) => [...prev, ...newPosts]);
      setPage((p) => p + 1);
      setHasMore(newPosts.length === initialLimit);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadMore();
  }, []);

  return { posts, loading, hasMore, loadMore };
}
