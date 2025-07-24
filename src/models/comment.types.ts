export type Like = { userId: string };
export type Author = { id: string; name: string | null; email: string | null; image: string | null };
export type Reply = { likes: Like[]; author: Author };

export type CommentWithLikes = {
  likes: Like[];
  replies: Reply[];
  author: Author;
};