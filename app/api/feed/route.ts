import { prisma } from '../../../lib/prisma';
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


// export async function GET() {
//   try {
//     // Get total count first
//     const totalCount = await prisma.note.count({
//       where: {
//         // Add any filtering conditions (e.g., isPrivate: false)
//         isPrivate: false
//       }
//     });

//     // If 50 or fewer notes exist, return all
//     if (totalCount <= 50) {
//       const notes = await prisma.note.findMany({
//         where: { isPrivate: false },
//         include: {
//           user: { select: { username: true } },
//           tags: true
//         },
//         orderBy: { createdAt: 'desc' }
//       });
//       return NextResponse.json(notes);
//     }

//     // For PostgreSQL: Use TABLESAMPLE or ORDER BY RANDOM()
//     const randomNotes = await prisma.$queryRaw`
//       SELECT n.*, u.username, array_agg(json_build_object('id', t.id, 'name', t.name)) as tags
//       FROM "Note" n
//       LEFT JOIN "User" u ON n."userId" = u.id
//       LEFT JOIN "_NoteToTag" nt ON n.id = nt."A"
//       LEFT JOIN "Tag" t ON nt."B" = t.id
//       WHERE n."isPrivate" = false
//       GROUP BY n.id, u.username
//       ORDER BY RANDOM()
//       LIMIT 50
//     `;

//     return NextResponse.json(randomNotes);

//   } catch (error) {
//     console.error('Feed fetch error:', error);
//     return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
//   }
// }