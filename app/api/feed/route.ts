import { prisma } from '../../../lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const notes = await prisma.note.findMany({
            where: {
                private: false, // Only return public notes
            },
            include: {
                tags: true,
                user: {
                    select: {
                        username: true, // Include author information
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            }
        })

        return NextResponse.json(notes)
    } catch (error) {
        console.error('API FEED GET ERROR:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}