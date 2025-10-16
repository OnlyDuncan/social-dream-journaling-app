"use client";

import { ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import FavoriteHeart from "./HeartButton";

export type Note = {
    id: string;
    user: { username: string };
    title: string;
    content: string;
    tags: { name: string }[];
};

type DreamCardProps = {
    dream: Note;
    isFavorited: boolean;
    onToggleFavorite: () => void;
    onOpen: () => void;
    style?: React.CSSProperties;
    truncateAt?: number;
};

const baseStyle: React.CSSProperties = {
    width: 240,
    maxHeight: 320,
    padding: "12px 14px",
    background: "#ffffffee",
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(2px)",
    transition: "box-shadow 0.2s",
    cursor: "pointer",
};

export default function DreamCard({ 
    dream,
    isFavorited,
    onToggleFavorite,
    onOpen,
    style,
    truncateAt = 220,
}: DreamCardProps) {
    const preview = 
        dream.content.length > truncateAt
            ? dream.content.slice(0, truncateAt) + "..."
            : dream.content;

    return (
        <div
            style={{ ...baseStyle, ...style }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.35)")
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.25)")
            }
            onClick={onOpen}
        >
            <h3 className="font-bold mb-1">{dream.title}</h3>
            <h2 className="text-sm text-gray-600 mb-2">
                By {dream.user?.username || "Unknown"}
            </h2>
            <div className="prose prose-sm max-w-none flex-1 overflow-auto mb-2">
                <ReactMarkdown>{preview}</ReactMarkdown>
            </div>
            <p className="text-[10px] text-gray-600">
                Tags: {" "}
                {dream.tags?.length
                    ? dream.tags.map((t) => t.name).join(", ")
                    : "No Tags"}
            </p>
            <div
                className="mt-1"
            >
                <FavoriteHeart isFavorited={isFavorited} onToggle={() => {}} static={true} />
            </div>
        </div>
    );
}