import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
    
    let userId, friendId;
    
    try {
        const auth = getAuth(req);
        userId = auth.userId; 
        const body = await req.json();
        friendId = body.friendId;
        
    } catch (authError) {
        return NextResponse.json({ 
            error: "Auth or request parsing failed",
            details: authError instanceof Error ? authError.message : String(authError)
        }, { status: 500 });
    }

    if (!userId || !friendId) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    try {
        const deletedRequests = await prisma.friendRequest.deleteMany({
            where: {
                OR: [
                    { fromId: userId, toId: friendId, status: 'accepted' },
                    { fromId: friendId, toId: userId, status: 'accepted' },
                ],
            },
        });

        if (deletedRequests.count === 0) {
            return NextResponse.json({ 
                error: 'Friendship not found',
                debug: {
                    userId,
                    friendId,
                }
            }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Friend removed successfully',
            deletedRequests: deletedRequests.count
        });
    } catch (error) {
        console.error('Error removing friend:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}