import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' });
    }

    // Get user details from Clerk
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const username = clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0];

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        username: username || `user_${userId.slice(0, 8)}`,
        description: '',
        profilePicture: null,
      }
    });

    return NextResponse.json({ message: 'User created', user: newUser });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}