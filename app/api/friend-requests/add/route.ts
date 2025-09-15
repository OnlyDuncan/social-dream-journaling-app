import { prisma } from "@/lib/prisma";
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        console.log("=== FRIEND REQUEST DEBUG ===");
        console.log("Authenticated user ID:", userId);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { toId } = await req.json();
        console.log("Request body - toId:", toId);
        console.log("toId type:", typeof toId);

        if (!toId) {
            return NextResponse.json({ error: "Missing recipient ID" }, { status: 400 });
        }

        if (toId === userId) {
            return NextResponse.json({ error: "You cannot add yourself" }, { status: 400 });
        }

        console.log("Checking if users exist...");
        const [fromUser, targetUser] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.user.findUnique({ where: { id: toId } })
        ]);

        console.log("From user (you) found:", !!fromUser, fromUser?.username);
        console.log("Target user found:", !!targetUser, targetUser?.username);

        if (!fromUser) {
            return NextResponse.json({ error: "Your user account not found in database" }, { status: 404 });
        }

        if (!targetUser) {
            return NextResponse.json({ error: "Target user not found" }, { status: 404 });
        }

        const existing = await prisma.friendRequest.findFirst({
            where: {
                fromId: userId,
                toId,
            },
        });
        console.log("Existing request found:", existing);

        if (existing) {
            if (existing.status === "pending") {
                return NextResponse.json({ error: "Friend request already pending" }, { status: 400 });
            } else if (existing.status === "accepted") {
                return NextResponse.json({ error: "You are already friends" }, { status: 400 });
            } else if (existing.status === "rejected") {
                console.log("Re-activating previously rejected request");
                const updatedRequest = await prisma.friendRequest.update({
                    where: { id: existing.id },
                    data: { 
                        status: "pending",
                        createdAt: new Date()
                    },
                    include: {
                        from: true,
                        to: true,
                    },
                });
                return NextResponse.json(updatedRequest, { status: 201 });
            }
        }

        const reverseRequest = await prisma.friendRequest.findFirst({
            where: {
                fromId: toId,
                toId: userId,
            },
        });

        if (reverseRequest) {
            if (reverseRequest.status === "pending") {
                return NextResponse.json({ error: "This user has already sent you a friend request" }, { status: 400 });
            } else if (reverseRequest.status === "accepted") {
                return NextResponse.json({ error: "You are already friends" }, { status: 400 });
            }
        }

        console.log("Creating friend request from", userId, "to", toId);
        const request = await prisma.friendRequest.create({
            data: {
                fromId: userId,
                toId,
                status: "pending",
            },
        });
        console.log("Friend request created successfully:", request);

        const requestWithRelations = await prisma.friendRequest.findUnique({
            where: { id: request.id },
            include: {
                from: true,
                to: true,
            },
        });

        console.log("=== END DEBUG ===");
        return NextResponse.json(requestWithRelations, { status: 201 });
    } catch (error) {
        console.error("=== DETAILED ERROR ===");
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("Error cause:", error instanceof Error ? error.cause : 'No cause');
        console.error("=== END ERROR ===");
        
        return NextResponse.json({ 
            error: "Failed to create friend request",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}