import { prisma } from "@/lib/prisma";
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { userId } = getAuth(req);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requests = await prisma.friendRequest.findMany({
        where: {
            toId: userId,
            status: "pending",
        },
        include: {
            from: true,
            to: true,
        },
    });

    return NextResponse.json({ requests });
}