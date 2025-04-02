
// usePosts hook
function PostsList() {
    const { posts, loading, page, totalPages, nextPage, prevPage } = usePosts();
  
    if (loading) return <div>Loading...</div>;
  
    return (
      <div>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        
        <div className="pagination">
          <button onClick={prevPage} disabled={page === 1}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={nextPage} disabled={page >= totalPages}>Next</button>
        </div>
      </div>
    );
  }

// useComments Hook
  function CommentsSection({ postId }: { postId: string }) {
    const { comments, loading, page, totalPages, nextPage } = useComments(postId);
  
    return (
      <div>
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        
        {page < totalPages && (
          <button onClick={nextPage} disabled={loading}>
            {loading ? 'Loading...' : 'Load More Comments'}
          </button>
        )}
      </div>
    );
  }

  // useLikes hook
  function LikeButton({ postId, userId }: { postId: string; userId?: string }) {
    const { isLiked, likeCount, toggleLike, loading } = useLikes(postId, userId);
  
    return (
      <button onClick={toggleLike} disabled={loading || !userId}>
        {isLiked ? '❤️' : '🤍'} {likeCount}
      </button>
    );
  }