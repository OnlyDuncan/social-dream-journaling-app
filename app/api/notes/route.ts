import { prisma } from '../../../lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import { clerkClient } from "@clerk/clerk-sdk-node"
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const profileUserId = searchParams.get("userId");
    const { userId: loggedInUserId} = getAuth(req)

    if (!profileUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: profileUserId,
        OR: [
          { private: false },
          { userId: loggedInUserId ?? "" },
        ]
      },
      include: { 
        user: {
          select: { username: true },
        },
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const normalizeNotes = notes.map(note => ({
      ...note,
      isPrivate: note.private
    }));

    return NextResponse.json(normalizeNotes)
  } catch (error) {
    console.error('API GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unathorized' }, { status: 401 })
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const username = clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || `user-${userId.slice(0, 6)}`;

    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          username,
        },
      });
    }

    const { title, content, tags, isPrivate } = await req.json()

    const newNote = await prisma.note.create({
      data: {
        title,
        content,
        private: isPrivate ?? false,
        userId,
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: { 
        tags: true,
        user: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json({ ...newNote, isPrivate: newNote.private }, { status: 201 })
  } catch (error) {
    console.error('API POST Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
