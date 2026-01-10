"use client";

import { Box, Button, Typography, Link } from "@mui/material";
import AvatarPlaceholder from "./AvatarPlaceholder";
import { CldImage } from "next-cloudinary";

type FriendRequestCardProps = {
    from: { id: string; username: string, profilePicture?: string };
    onAccept: () => void;
    onReject: () => void;
};

export default function FriendRequestCard({ 
    from,
    onAccept,
    onReject,
}: FriendRequestCardProps) {
    return (
        <Box 
            className="border-b py-4" 
            sx={{ 
                backgroundColor: "#B0E0E6",
                borderRadius: 2,
                p: 2,
            }}
        >
            <Typography className="text-xl font-semibold" sx={{ m: "auto", p: "auto", mb: 2 }}>
                <Link href={`/profile/${from.id}`}>
                    {from?.username || "Unknown"}
                </Link>
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                {/* <AvatarPlaceholder size={48} className="mb-2" /> */}
                <CldImage
                    src={from?.profilePicture || "/default-avatar.png"}
                    alt={`${from?.username}'s profile picture` || "Unknown"}
                    width={40}
                    height={40}
                    crop="fill"
                    className="rounded-full"
                />
                <Button onClick={onAccept} className="mb-4" variant="contained" color="primary">
                    Accept
                </Button>
                <Button onClick={onReject} className="mb-4" variant="contained" color="secondary">
                    Reject
                </Button>
            </Box>
        </Box>
    );
}