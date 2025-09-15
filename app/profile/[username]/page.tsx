import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({ params }: { params: { username: string } }) {

  const { username } = await params;

  const { userId: loggedInUserId } = await auth();
  
  const profileUser = await prisma.user.findUnique({
    where: { username },
    include: {
      notes: {
        where: { private: false },
        orderBy: { createdAt: "desc" },
      },
      favoriteNotes: {
        include: {
          tags: true,
          user: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profileUser) return notFound();

  const isOwnProfile = profileUser.id === loggedInUserId;

  return (
    <ProfileClient
      user={{
        ...profileUser,
      }}
      isOwnProfile={isOwnProfile}
      profileUserId={profileUser.id}
    />
  );
}
