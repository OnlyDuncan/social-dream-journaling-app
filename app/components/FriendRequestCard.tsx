"use client";

import { ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import FavoriteHeart from "./HeartButton";

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
        <div className="border-b py-4">
            <h2 className="text-xl font-semibold">From: {from?.username || "Unknown"}</h2>
            <button onClick={onAccept} className="mb-4 px-4 py-2 bg-purple-600 text-white rounded">
                Accept
            </button>
            <button onClick={onReject} className="mb-4 px-4 py-2 bg-red-600 text-white rounded">
                Reject
            </button>
        </div>
    );
}