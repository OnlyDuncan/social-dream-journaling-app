"use client";

import { ReactNode, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import FavoriteHeart from "./HeartButton";
import DeleteButton from "./DeleteButton";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

type DreamModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    tags: string[];
    author?: string;
    isFavorited?: boolean;
    onToggleFavorite: () => void;
    handleDelete: () => void;
    canFavorite: boolean;
};

type Favorite = DreamModalProps & { id: string };

export default function DreamModal({ 
    isOpen, 
    onClose, 
    title,
    content,
    tags, 
    author,
    isFavorited = false,
    onToggleFavorite,
    handleDelete,
    canFavorite,
}: DreamModalProps) {

    if (!isOpen) return null;

    const { user } = useUser();
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    const isAuthor = user?.username === author;

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/favorites");
            if (res.ok) {
                const data = await res.json();
                setFavoriteIds(new Set(data.map((fav: Favorite) => fav.id)));
            }
        })();
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            style={{ zIndex: 9999 }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{title}</h2>
                        <Link href={`/profile/${author}`} className="text-gray-600 mb-4">By {author}</Link>
                    </div>
                    
                    <div className="ml-4">
                        <FavoriteHeart
                            isFavorited={isFavorited}
                            canFavorite={canFavorite}
                            onToggle={onToggleFavorite}
                            static={true}
                        />
                        {isAuthor && (
                            <DeleteButton
                                static={true}
                                delete={handleDelete}
                            />
                        )}
                    </div>
                </div>

                <div className="prose prose-lg max-w-none mb-6">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-600">
                        Tags: {tags.length > 0 ? tags.join(", ") : "No tags"}
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}