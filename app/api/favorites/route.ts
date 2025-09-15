import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// API for Adding a note to favorites
export async function POST(req: NextRequest) {
    try {
        // Renames userId property of Clerks authorization object to loggedInUserId
        const { userId: loggedInUserId } = getAuth(req);
        // If no logged in user, return unauthorized
        if (!loggedInUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        // Extract noteId from request body
        const { noteId } = await req.json();
        // If no notedId, return bad request
        if (!noteId) {
            return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
        }
        // Note is equal to note object with matching noteId
        const note = await prisma.note.findUnique({
            where: { id: noteId },
        })
        // If no note found, return not found
        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 })
        }
        // Upsert: Creates a new user if none exist, otherwise does nothing
        await prisma.user.upsert({
            where: { id: loggedInUserId },
            update: {},
            create: {
                id: loggedInUserId,
                username: `user-${loggedInUserId.slice(0, 8)}`, // Generate default username
            },
        });
        // Updating the user by connecting the note to the user's favoriteNotes relationship
        const updatedUser = await prisma.user.update({
            where: { id: loggedInUserId },
            data: {
                favoriteNotes: {
                    connect: { id: noteId },
                },
            },
            include: {
                favoriteNotes: {
                    include: { tags: true, user: { select: { id: true, username: true }}}
                },
            },
        })
        // Return the updated list of favorite notes
        return NextResponse.json(updatedUser.favoriteNotes, { status: 200 })

    } catch (error) {
        console.error('Add Favorite Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// API for Removing a note from favorites
export async function DELETE(req: NextRequest) {

    try {

        const { userId: loggedInUserId } = getAuth(req);

        if (!loggedInUserId) {
            return NextResponse.json({ error: 'Unathorized' }, { status: 401 })
        }

        const { noteId } = await req.json();

        if (!noteId) {
            return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
        }

        const note = await prisma.note.findUnique({
            where: { id: noteId },
        })

        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: loggedInUserId },
            data: {
                favoriteNotes: {
                    disconnect: { id: noteId },
                },
            },
            include: {
                favoriteNotes: {
                    include: { tags: true, user: { select: { id: true, username: true }}}
                },
            },
        })

        return NextResponse.json(updatedUser.favoriteNotes, { status: 200 })

    } catch (error) {
        console.error('Delete Favorite Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// API for Getting a users favorite notes
export async function GET(req: NextRequest) {

    try {

        const { searchParams } = new URL(req.url);

        const profileUserId = searchParams.get("userId");

        const { userId: loggedInUserId } = getAuth(req);

        if (!loggedInUserId) {
            return NextResponse.json({ error: 'Unathorized' }, { status: 401 })
        }

        // Use profileUserId if it exists, otherwise use loggedInUserId
        const targetUserId = profileUserId ?? loggedInUserId;

        const userWithFavorites = await prisma.user.findUnique({
            where: { id: targetUserId},
            include: {
                favoriteNotes: {
                    include: {
                        tags: true,
                        user: { select: { id: true, username: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!userWithFavorites) {
            return NextResponse.json([], { status: 200 })
        }

        return NextResponse.json(userWithFavorites.favoriteNotes, { status: 200 })

    } catch (error) {
        console.error('API GET Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}