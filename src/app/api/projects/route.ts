import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, postcode, latitude, longitude, imageUrls, categories = [] } = body;

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        postcode,
        latitude,
        longitude,
        authorId: session.user.id,
        categories: {
          connect: categories.slice(0, 3).map((id: string) => {
            return { id };
          }), //only 3 allowed
        },
        images: {
          create:
            imageUrls?.map((url: string) => ({
              url,
            })) || [],
        },
      },
      include: {
        images: true,
        categories: true,
      },
    });

    return NextResponse.json({ projectId: project.id, project }, { status: 201 });
  } catch (err) {
    console.error("[PROJECT_CREATE_ERROR]", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        categories: true,
        images: true,
        comments: true,
        likes: true,
        author: {
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
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("[PROJECT_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
