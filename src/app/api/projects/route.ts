import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, postcode, latitude, longitude, imageUrls } = body;

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        postcode,
        latitude,
        longitude,
        imageUrls: imageUrls ?? [],
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ projectId: project.id, project }, { status: 201 });
  } catch (err) {
    console.error('[PROJECT_CREATE_ERROR]', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
