import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { userId: loggedInUserId } = getAuth(req);

  if (!loggedInUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get('userId') || loggedInUserId;

  const accepted = await prisma.friendRequest.findMany({
    where: {
      OR: [
        { fromId: targetUserId, status: 'accepted' },
        { toId: targetUserId, status: 'accepted' },
      ],
    },
    include: {
      from: { select: { id: true, username: true } },
      to: { select: { id: true, username: true } },
    },
  });

  const friends = accepted.map((req) =>
    req.fromId === targetUserId ? req.to : req.from
  );

  return NextResponse.json(friends);
}
