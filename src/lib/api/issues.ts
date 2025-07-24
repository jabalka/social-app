import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { IssueStatus, IssuePriority, IssueType, Prisma } from "@prisma/client";
import { hasPermission } from "../role-permissions";

export interface IssueUpdateInput {
  title?: string;
  description?: string;
  issueType?: IssueType;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  what3words?: string;
  address?: string;
  landmark?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  newImageUrls?: string[];
  deletedImageUrls?: string[];
}

export const createIssueReport = async (req: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const body = await req.json();
    const { 
      title, 
      description, 
      issueType, 
      postcode, 
      latitude, 
      longitude, 
      what3words,
      address,
      landmark,
      priority = "MEDIUM",
      imageUrls = [] 
    } = body;

    const issue = await prisma.issueReport.create({
      data: {
        title,
        description,
        issueType,
        postcode,
        latitude,
        longitude,
        what3words,
        address,
        landmark,
        priority,
        reporterId: session.user.id,
        images: {
          create: imageUrls?.map((url: string) => ({ url })) || [],
        },
      },
      include: {
        images: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: { select: { id: true, name: true, icon: true } },
          },
        },
      },
    });

    return { data: { issueId: issue.id, issue }, status: 201 };
  } catch (err) {
    console.error("[ISSUE_CREATE_ERROR]", err);
    return { error: "Failed to create issue report", status: 500 };
  }
};

export const updateIssueReport = async (
  id: string,
  {
    title,
    description,
    issueType,
    postcode,
    latitude,
    longitude,
    what3words,
    address,
    landmark,
    status,
    priority,
    newImageUrls = [],
    deletedImageUrls = [],
  }: IssueUpdateInput,
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const roleName = session.user.role?.name || null;
  
  try {
    const issue = await prisma.issueReport.findUnique({
      where: { id },
      include: { reporter: { select: { id: true } } },
    });

    if (!issue) {
      return { error: "Issue report not found", status: 404 };
    }

    const isReporter = issue.reporter.id === session.user.id;
    const isAdmin = hasPermission(roleName, ["admin", "council", "mayor"]);

    const updateData: Prisma.IssueReportUpdateInput = {};

    if (isReporter || isAdmin) {
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (issueType !== undefined) updateData.issueType = issueType;
      if (postcode !== undefined) updateData.postcode = postcode;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (what3words !== undefined) updateData.what3words = what3words;
      if (address !== undefined) updateData.address = address;
      if (landmark !== undefined) updateData.landmark = landmark;
      if (priority !== undefined) updateData.priority = priority;
    }

    if (status !== undefined && isAdmin) {
      updateData.status = status;
      
      if (status === "RESOLVED") {
        updateData.resolvedAt = new Date();
      } else {
        updateData.resolvedAt = null;
      }
    }

    if (deletedImageUrls.length > 0 && (isReporter || isAdmin)) {
      await prisma.issueImage.deleteMany({
        where: { issueId: id, url: { in: deletedImageUrls } },
      });
    }

    if (newImageUrls.length > 0 && (isReporter || isAdmin)) {
      await prisma.issueImage.createMany({
        data: newImageUrls.map((url: string) => ({ issueId: id, url })),
      });
    }

    let updatedIssue;
    if (Object.keys(updateData).length > 0) {
      updatedIssue = await prisma.issueReport.update({
        where: { id },
        data: updateData,
        include: {
          images: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: { select: { id: true, name: true, icon: true } },
            },
          },
        },
      });
    } else {
      updatedIssue = await prisma.issueReport.findUnique({
        where: { id },
        include: {
          images: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: { select: { id: true, name: true, icon: true } },
            },
          },
        },
      });
    }

    return { data: updatedIssue, status: 200 };
  } catch (error) {
    console.error("[ISSUE_UPDATE_ERROR]", error);
    return { error: "Failed to update issue report", status: 500 };
  }
};

export const getIssueReport = async (id: string) => {
  try {
    const issue = await prisma.issueReport.findUnique({
      where: { id },
      include: {
        images: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        likes: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: { select: { id: true, name: true, icon: true } },
          },
        },
      },
    });

    if (!issue) {
      return { error: "Issue report not found", status: 404 };
    }

    return { data: issue, status: 200 };
  } catch (error) {
    console.error("[ISSUE_GET_ERROR]", error);
    return { error: "Failed to fetch issue report", status: 500 };
  }
};

export const deleteIssueReport = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const roleName = session.user.role?.name || null;
    const issue = await prisma.issueReport.findUnique({
      where: { id },
      include: { reporter: { select: { id: true } } },
    });

    if (!issue) {
      return { error: "Issue report not found", status: 404 };
    }

    const isReporter = issue.reporter.id === session.user.id;
    const isAdmin = hasPermission(roleName, ["admin", "council", "mayor"]);

    if (!isReporter && !isAdmin) {
      return { error: "Forbidden: You can only delete your own issue reports", status: 403 };
    }

    await prisma.issueReport.delete({ where: { id } });

    return { data: { message: "Issue report deleted successfully" }, status: 200 };
  } catch (error) {
    console.error("[ISSUE_DELETE_ERROR]", error);
    return { error: "Failed to delete issue report", status: 500 };
  }
};

export const getAllIssueReport = async (req: Request) => {
  const url = new URL(req.url);
  const near = url.searchParams.get("near");
  const radius = parseInt(url.searchParams.get("radius") || "5000", 10);
  const sort = url.searchParams.get("sort") || "createdAt";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;
  const status = url.searchParams.get("status") || null;
  const issueType = url.searchParams.get("issueType") || null;
  const reporterId = url.searchParams.get("reporterId") || null;

  let orderBy: Prisma.IssueReportOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "likes") {
    orderBy = { likes: { _count: "desc" } };
  } else if (sort === "comments") {
    orderBy = { comments: { _count: "desc" } };
  } else if (sort === "priority") {
    // Priority high to low (URGENT -> HIGH -> MEDIUM -> LOW)
    orderBy = { priority: "desc" };
  }

  const whereClause: Prisma.IssueReportWhereInput = {};
  
  if (status) {
    whereClause.status = status as IssueStatus;
  }
  
  if (issueType) {
    whereClause.issueType = issueType as IssueType;
  }
  
  if (reporterId) {
    whereClause.reporterId = reporterId;
  }

  try {
    if (near) {
      const [lat, lng] = near.split(",").map(Number);
      if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
        throw new Error("Invalid coordinates or radius");
      }
      const raw = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "IssueReport"
        WHERE (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians("latitude"))
            * cos(radians("longitude") - radians(${lng}))
            + sin(radians(${lat})) * sin(radians("latitude"))
          )
        ) < ${radius}
      `;

      const issueIds = raw.map((r) => r.id);

      if (!issueIds.length) return { data: { issues: [], totalCount: 0 }, status: 200 };

      whereClause.id = { in: issueIds };

      const [issues, totalCount] = await Promise.all([
        prisma.issueReport.findMany({
          where: whereClause,
          include: {
            images: true,
            comments: true,
            likes: true,
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                    icon: true,
                  },
                },
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.issueReport.count({
          where: whereClause,
        }),
      ]);

      return { data: { issues, totalCount }, status: 200 };
    }

    const [issues, totalCount] = await Promise.all([
      prisma.issueReport.findMany({
        where: whereClause,
        include: {
          images: true,
          comments: true,
          likes: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.issueReport.count({
        where: whereClause,
      }),
    ]);

    return { data: { issues, totalCount }, status: 200 };
  } catch (error) {
    console.error("[ISSUE_GET_ERROR]", error);
    return { error: "Failed to fetch issue reports", status: 500 };
  }
};

export const toggleIssueLike = async (issueId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { data: { liked: false }, status: 200 };
    } else {
      const newLike = await prisma.like.create({
        data: {
          issueId,
          userId: session.user.id,
        },
      });
      return { data: { liked: true, like: newLike }, status: 201 };
    }
  } catch (error) {
    console.error("[ISSUE_LIKE_ERROR]", error);
    return { error: "Failed to toggle like", status: 500 };
  }
};

export const getIssueLikes = async (issueId: string) => {
  try {
    const likes = await prisma.like.findMany({
      where: { issueId },
      select: {
        id: true,
        userId: true,
        createdAt: true,
      },
    });
    return { data: likes, status: 200 };
  } catch (error) {
    console.error("[ISSUE_LIKE_FETCH_ERROR]", error);
    return { error: "Failed to fetch likes", status: 500 };
  }
};

export const createIssueComment = async (issueId: string, content: string, parentId?: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const issue = await prisma.issueReport.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      return { error: "Issue report not found", status: 404 };
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        issueId,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return { data: comment, status: 201 };
  } catch (error) {
    console.error("[ISSUE_COMMENT_CREATE_ERROR]", error);
    return { error: "Failed to create comment", status: 500 };
  }
};

export const getIssueComments = async (issueId: string, page: number, pageSize: number) => {
  try {
    const skip = (page - 1) * pageSize;
    
    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: { 
          issueId,
          isVisible: true,
          parentId: null 
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            where: { isVisible: true },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          likes: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.comment.count({
        where: { 
          issueId,
          isVisible: true,
          parentId: null 
        },
      }),
    ]);

    return { 
      data: { 
        comments, 
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page
      }, 
      status: 200 
    };
  } catch (error) {
    console.error("[ISSUE_COMMENTS_FETCH_ERROR]", error);
    return { error: "Failed to fetch comments", status: 500 };
  }
};