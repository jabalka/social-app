// Extend the basic Prisma types with relations
export type PostWithDetails = Post & {
  author: Pick<User, 'id' | 'name' | 'image'>;
  _count: {
    comments: number;
    likes: number;
  };
};

export type CommentWithAuthor = Comment & {
  author: Pick<User, 'id' | 'name' | 'image'>;
};

export type PostWithAllDetails = Post & {
  author: Pick<User, 'id' | 'name' | 'image'>;
  comments: CommentWithAuthor[];
  likes: Array<{
    user: Pick<User, 'id' | 'name'>;
  }>;
};