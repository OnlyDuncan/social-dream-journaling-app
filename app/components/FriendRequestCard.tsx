"use client";

import { Box, Button, Typography, Link } from "@mui/material";
import AvatarPlaceholder from "./AvatarPlaceholder";

type FriendRequestCardProps = {
    from: { id: string; username: string };
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
                <AvatarPlaceholder size={48} className="mb-2" />
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