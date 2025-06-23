import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getUserById(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        createdAt: true,
        roleId: true,
        comments: true,
        likes: true,
        ideas: true,
        projects: true,
        role: true,
      },
    });

    if (!user) {
      return { error: "User not found", status: 404 };
    }

    return { data: user, status: 200 };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: "Internal Server Error", status: 500 };
  }
}

export async function updateUserProfile(req: Request) {
    const session = await auth();
  
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }
  
    const { name, username, imageUrl } = await req.json();
  
    try {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: name ?? undefined,
          username: username ?? undefined,
          image: imageUrl ?? undefined,
        },
        include: {
          comments: true,
          likes: true,
          ideas: true,
          projects: true,
          role: true,
        },
      });
  
      return { data: updatedUser, status: 200 };
    } catch (error) {
      console.error("[USER_UPDATE_ERROR]", error);
      return { error: "Profile update failed", status: 500 };
    }
  }

export async function getUserCommentsAndLikes(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Unauthorized", status: 401 };
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const skip = (page - 1) * pageSize;

  try {
    const projects = await prisma.project.findMany({
      where: { authorId: userId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    const projectLikeCount = await prisma.like.count({
      where: { projectId: { in: projectIds } },
    });

    const totalCommentCount = await prisma.comment.count({
      where: {
        projectId: { in: projectIds },
        parentId: null,
      },
    });

    const comments = await prisma.comment.findMany({
      where: {
        projectId: { in: projectIds },
        parentId: null,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        likes: true,
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            likes: true,
            author: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    return {
      data: {
        comments,
        projectLikeCount,
        totalCommentCount,
        hasMore: skip + pageSize < totalCommentCount,
      },
      status: 200,
    };
  } catch (error) {
    console.error("[USER_COMMENTS_LIKES_ERROR]", error);
    return { error: "Failed to fetch comments and likes", status: 500 };
  }
}

export async function getUserProjects(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const url = new URL(req.url);
  const sort = url.searchParams.get("sort"); // 'date' | 'likes' | 'comments'
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "5", 10);
  const skip = (page - 1) * limit;

  let orderBy: Prisma.ProjectOrderByWithRelationInput = { createdAt: "desc" };

  if (sort === "likes") {
    orderBy = {
      likes: {
        _count: "desc",
      },
    };
  } else if (sort === "comments") {
    orderBy = {
      comments: {
        _count: "desc",
      },
    };
  }

  try {
    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where: { authorId: session.user.id },
        include: {
          images: true,
          categories: true,
          comments: true,
          likes: true,
          author: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count({
        where: { authorId: session.user.id },
      }),
    ]);

    return { data: { projects, totalCount }, status: 200 };
  } catch (error) {
    console.error("[USER_PROJECTS_GET_ERROR]", error);
    return { error: "Failed to fetch user's projects", status: 500 };
  }
}
