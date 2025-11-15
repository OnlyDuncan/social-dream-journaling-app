"use client";

import { Box, Link } from "@mui/material";
import AvatarPlaceholder from "./AvatarPlaceholder";

type FriendCardProps = {
    username: string;
};

export default function FriendCard({ 
    username,
}: FriendCardProps) {

    return (
        <Box 
            className="border-b py-4"
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#D1F2FF",
                minWidth: 200,
                flexShrink: 0,
            }}
        >
            <AvatarPlaceholder size={48} className="mb-2" />
            <h2 className="text-xl font-semibold"> {username || "Unknown"}</h2>
        </Box>
    );
}