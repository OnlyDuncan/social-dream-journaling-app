import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchParams {
  query?: string;
  tags?: string[];
  searchType: 'users' | 'notes' | 'both';
}

export async function performSearch({ query, tags, searchType }: SearchParams) {
  const results: any = {};

  if (searchType === 'users' || searchType === 'both') {
    if (query) {
      results.users = await searchUsers(query);
    }
  }

  if (searchType === 'notes' || searchType === 'both') {
    if (tags && tags.length > 0) {
      results.notes = await searchNotesByTags(tags);
    } else if (query) {
      results.notes = await prisma.note.findMany({
        where: {
          private: false,
          OR: [
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              content: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          tags: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });
    }
  }

  return results;
}

export async function searchNotesByTags(tagNames: string[]) {
  return await prisma.note.findMany({
    where: {
      private: false,
      tags: {
        some: {
          name: {
            in: tagNames.map(tag => tag.toLowerCase()),
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      tags: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });
}

export async function searchUsers(query: string) {
  return await prisma.user.findMany({
    where: {
      username: {
        contains: query,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      username: true,
    },
    take: 20,
  });
}