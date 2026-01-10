import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  const { fromId } = await req.json();

  if (!userId || !fromId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const request = await prisma.friendRequest.findUnique({
      where: { fromId_toId: { fromId, toId: userId } },
    });

    if (!request || request.status !== 'pending') {
      return NextResponse.json({ error: 'No pending request found' }, { status: 404 });
    }

    await prisma.friendRequest.update({
      where: { fromId_toId: { fromId, toId: userId } },
      data: { status: 'accepted' },
    });

    return NextResponse.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept Friend Request Error:', error);
    return NextResponse.json({ error: 'Failed to accept request' }, { status: 500 });
  }
}
