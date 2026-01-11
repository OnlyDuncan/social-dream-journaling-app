"use client";

import { Box, Link } from "@mui/material";
import AvatarPlaceholder from "./AvatarPlaceholder";
import { CldImage } from 'next-cloudinary';

type FriendCardProps = {
    username: string;
    profilePicture?: string;
};

export default function FriendCard({ 
    username,
    profilePicture
}: FriendCardProps) {

    return (
        <Link href={`/profile/${username}`}>
            <Box 
                className="border-b py-4"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "#D1F2FF",
                    minWidth: 200,
                    flexShrink: 0,
                    borderRadius: 2,
                }}
            >
                {profilePicture ? (
                    <CldImage
                        src={profilePicture || "/default-avatar.png"}
                        alt={`${username}'s profile picture` || "Unknown"}
                        width={40}
                        height={40}
                        crop="fill"
                        className="rounded-full"
                    />
                ) : (
                    <AvatarPlaceholder size={40} className="rounded-full mb-2" />
                )}
                <h2 className="text-xl font-semibold"> {username || "Unknown"}</h2>
            </Box>
        </Link>
    );
}