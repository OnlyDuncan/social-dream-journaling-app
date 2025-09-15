import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  const { fromId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.friendRequest.update({
      where: { fromId_toId: { fromId, toId: userId } },
      data: { status: 'rejected' },
    });

    return NextResponse.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject Friend Request Error:', error);
    return NextResponse.json({ error: 'Failed to reject request' }, { status: 500 });
  }
}

