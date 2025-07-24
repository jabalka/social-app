import { prisma } from "@/lib/prisma";
import { CollaborationStatus } from "@prisma/client";

type IdeaIdRow = { id: string }

export async function getAllIdeas() {
  return prisma.idea.findMany({
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
      comments: true,
      collaborators: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIdeaById(id: string) {
  return prisma.idea.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
      comments: true,
      collaborators: true,
    },
  });
}

export async function getIdeasNearby(lat: number, lng: number, radius: number) {
  const raw = await prisma.$queryRaw<IdeaIdRow[]>`
    SELECT id
    FROM "Idea"
    WHERE (
      6371000 * acos(
        cos(radians(${lat})) * cos(radians("latitude"))
        * cos(radians("longitude") - radians(${lng}))
        + sin(radians(${lat})) * sin(radians("latitude"))
      )
    ) < ${radius}
  `;
  const ideaIds = raw.map(r => r.id);
  if (!ideaIds.length) return [];
  return prisma.idea.findMany({
    where: { id: { in: ideaIds } },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
      comments: true,
      collaborators: true,
    },
  });
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
