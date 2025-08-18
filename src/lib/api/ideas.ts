import { prisma } from "@/lib/prisma";
import { parseGeoParamsFromUrl, queryIdeaIdsWithinRadius } from "@/utils/geo.utils";
import { CollaborationStatus, Prisma } from "@prisma/client";

export type IdeaSort = "newest" | "oldest" | "likes" | "comments";

type IdeaIdRow = { id: string };

const defaultIdeaInclude = {
  author: { select: { id: true, name: true, image: true } },
  likes: true,
  comments: true,
  collaborators: true,
} satisfies Prisma.IdeaInclude;

function mapIdeaSortToOrderBy(sort: IdeaSort | undefined) {
  const s = sort ?? "newest";
  if (s === "oldest") return { createdAt: "asc" } as Prisma.IdeaOrderByWithRelationInput;
  if (s === "likes")
    return [{ likes: { _count: "desc" } }, { createdAt: "desc" }] as Prisma.IdeaOrderByWithRelationInput[];
  if (s === "comments")
    return [{ comments: { _count: "desc" } }, { createdAt: "desc" }] as Prisma.IdeaOrderByWithRelationInput[];
  return { createdAt: "desc" } as Prisma.IdeaOrderByWithRelationInput;
}

// Backward-compatible helpers (still exported if used elsewhere)
export async function getAllIdeas() {
  return prisma.idea.findMany({
    include: defaultIdeaInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getIdeaById(id: string) {
  return prisma.idea.findUnique({
    where: { id },
    include: defaultIdeaInclude,
  });
}

export async function getIdeasNearby(lat: number, lng: number, radiusMeters: number) {
  const rows = await prisma.$queryRaw<IdeaIdRow[]>`
    SELECT id
    FROM "Idea"
    WHERE (
      6371000 * acos(
        cos(radians(${lat})) * cos(radians("latitude"))
        * cos(radians("longitude") - radians(${lng}))
        + sin(radians(${lat})) * sin(radians("latitude"))
      )
    ) < ${radiusMeters}
  `;
  const ideaIds = rows.map((r) => r.id);
  if (!ideaIds.length) return [];
  return prisma.idea.findMany({
    where: { id: { in: ideaIds } },
    include: defaultIdeaInclude,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Unified ideas query with sort, owner, pagination, optional geo and what3words filters.
 */
export async function getIdeas(options?: {
  sort?: IdeaSort;
  page?: number;
  limit?: number;
  ownerId?: string;
  near?: { lat: number; lng: number; radiusMeters: number };
  what3words?: string;
}) {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.max(1, Math.min(100, options?.limit ?? 10));
  const skip = (page - 1) * limit;

  const orderBy = mapIdeaSortToOrderBy(options?.sort);

  let radiusIds: string[] | null = null;
  if (options?.near) {
    const { lat, lng, radiusMeters } = options.near;
    if (Number.isFinite(lat) && Number.isFinite(lng) && radiusMeters > 0) {
      radiusIds = await queryIdeaIdsWithinRadius(lat, lng, radiusMeters, prisma);
      if (!radiusIds.length) {
        return { ideas: [], totalCount: 0 };
      }
    }
  }

  const where: Prisma.IdeaWhereInput = {
    ...(options?.ownerId ? { authorId: options.ownerId } : {}),
    ...(options?.what3words ? { what3words: options.what3words } : {}),
    ...(radiusIds ? { id: { in: radiusIds } } : {}),
  };

  const [ideas, totalCount] = await Promise.all([
    prisma.idea.findMany({
      where,
      include: defaultIdeaInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.idea.count({ where }),
  ]);

  return { ideas, totalCount };
}

/**
 * Convenience helper to consume sort/page/limit/ownerId/what3words/near directly from a Request URL.
 * Accepts:
 * - sort: newest | oldest | likes | comments
 * - page: number
 * - limit: number
 * - ownerId: string (optional)
 * - what3words: string (optional)
 * - near: "lat,lng" and radius=meters via parseGeoParamsFromUrl
 */
export async function getIdeasForRequest(req: Request) {
  const url = new URL(req.url);
  const sort = (url.searchParams.get("sort") || "newest") as IdeaSort;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const ownerId = url.searchParams.get("ownerId") || undefined;
  const what3words = url.searchParams.get("what3words") || undefined;

  const { hasGeo, centerLat, centerLng, radiusMeters } = parseGeoParamsFromUrl(url);
  const near =
    hasGeo && centerLat !== null && centerLng !== null && radiusMeters > 0
      ? { lat: centerLat, lng: centerLng, radiusMeters }
      : undefined;

  return getIdeas({ sort, page, limit, ownerId, what3words, near });
}

export async function createIdea(
  {
    title,
    content,
    allowCollab,
    latitude,
    longitude,
    postcode,
    what3words,
  }: {
    title: string;
    content: string;
    allowCollab?: boolean;
    latitude?: number;
    longitude?: number;
    postcode?: string;
    what3words?: string;
  },
  userId: string,
) {
  return prisma.idea.create({
    data: {
      title,
      content,
      authorId: userId,
      allowCollab: allowCollab ?? true,
      latitude,
      longitude,
      postcode,
      what3words,
    },
  });
}

export async function updateIdea(
  id: string,
  data: Partial<{ title: string; content: string; allowCollab: boolean; isConverted: boolean; projectId: string }>,
) {
  return prisma.idea.update({
    where: { id },
    data,
  });
}

export async function deleteIdea(id: string) {
  return prisma.idea.delete({ where: { id } });
}

export async function createIdeaCollab(ideaId: string, userId: string) {
  return prisma.ideaCollaboration.create({
    data: {
      ideaId,
      userId,
      status: "PENDING",
    },
  });
}

export async function updateIdeaCollab(collabId: string, status: CollaborationStatus) {
  return prisma.ideaCollaboration.update({
    where: { id: collabId },
    data: { status },
  });
}

export async function deleteIdeaCollab(collabId: string, userId: string) {
  return prisma.ideaCollaboration.delete({
    where: { id: collabId, userId },
  });
}
