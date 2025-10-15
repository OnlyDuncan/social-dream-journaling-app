"use client";

import { ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import FavoriteHeart from "./HeartButton";

type FriendCardProps = {
    username: string;
};

export default function FriendCard({ 
    username,
}: FriendCardProps) {

    return (
        <div>
            <h2 className="text-xl font-semibold"> {username || "Unknown"}</h2>
        </div>
    );
}