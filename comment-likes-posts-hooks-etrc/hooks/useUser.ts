// hooks/useUser.ts
import { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import prisma from '@/lib/prisma';

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            posts: { take: 5, orderBy: { createdAt: 'desc' } },
            _count: { select: { posts: true, comments: true } }
          }
        });
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  return { user, loading, error, refresh: () => window.location.reload() };
}