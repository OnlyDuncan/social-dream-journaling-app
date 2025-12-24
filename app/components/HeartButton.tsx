import { useState } from "react";

type FavoriteHeartProps = {
    isFavorited: boolean;
    onToggle: () => void;
    static?: boolean;
    canFavorite: boolean;
};

export default function FavoriteHeart({ isFavorited, onToggle, static: isStatic = false, canFavorite }: FavoriteHeartProps) {
    const hoverClass = isStatic ? "" : "hover:scale-110";
    
    return (
        <button
            aria-label={isFavorited ? "Unfavorite" : "Favorite"}
            onClick={onToggle}
            className="focus:outline-none"
        >
            {isFavorited ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-6 h-6 text-red-500 transition-transform duration-200 ${hoverClass}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="none"
                >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${hoverClass}`}
                    fill={canFavorite ? "none" : "currentColor"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            )}
        </button>
    )
}