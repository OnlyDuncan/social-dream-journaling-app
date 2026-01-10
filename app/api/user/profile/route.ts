import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { profilePicture, description } = body;

        if (!profilePicture) {
            return NextResponse.json({ error: 'Profile picture URL required' }, { status: 400 });
        }

        // Update the user's profile picture in the database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profilePicture, description }
        });

        console.log('✅ Profile picture updated successfully');

        return NextResponse.json({ 
            message: 'Profile picture updated',
            profilePicture: updatedUser.profilePicture 
        });

    } catch (error) {
        console.error('❌ Error updating profile picture:', error);
        return NextResponse.json({ 
            error: 'Failed to update profile picture',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User Id requiered' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                profilePicture: true,
                description: true,
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
}