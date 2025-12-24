"use client";

import { ReactNode, useState, useMemo } from "react";
import { Link, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import FavoriteHeart from "./HeartButton";

type Note = {
    id: string;
    user: { username: string };
    title: string;
    content: string;
    tags: { name: string }[];
};

type ProfileDreamCardProps = {
    dream: Note;
    isFavorited: boolean;
    onToggleFavorite: () => void;
    onOpen: () => void;
    style?: React.CSSProperties;
    truncateAt?: number;
    canFavorite: boolean;
};

export default function ProfileDreamCard({ 
    dream,
    isFavorited,
    onToggleFavorite,
    onOpen,
    style,
    truncateAt = 30,
    canFavorite
}: ProfileDreamCardProps) {

    const baseStyle: React.CSSProperties = {
        width: "100%",
        marginBottom: 15,
        height: 175,
        padding: "12px 14px",
        background: "#808080",
        borderRadius: 12,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(2px)",
        transition: "box-shadow 0.2s",
        cursor: "pointer",
    };

    const fragmentColors = [
        "sepia(0.8) saturate(1.2) brightness(1.1)",                    // Classic aged paper
        "sepia(0.6) saturate(1.1) brightness(1.2) hue-rotate(10deg)",  // Warm cream
        "sepia(0.7) saturate(1.3) brightness(1.0) hue-rotate(15deg)",  // Antique beige
        "sepia(0.5) saturate(1.0) brightness(1.3) hue-rotate(20deg)",  // Light parchment
        "sepia(0.9) saturate(1.4) brightness(0.9) hue-rotate(25deg)",  // Deep aged paper
        "sepia(0.4) saturate(0.9) brightness(1.2) hue-rotate(5deg)",   // Pale cream
        "sepia(0.8) saturate(1.1) brightness(1.1) hue-rotate(30deg)",  // Golden aged
        "sepia(0.6) saturate(1.2) brightness(1.0) hue-rotate(-5deg)",  // Cool aged paper
        "sepia(0.7) saturate(1.0) brightness(1.2) hue-rotate(35deg)",  // Warm ivory
        "sepia(0.5) saturate(1.3) brightness(1.1) hue-rotate(12deg)",  // Vintage white
        "sepia(0.9) saturate(1.2) brightness(0.95) hue-rotate(18deg)", // Old manuscript
        "sepia(0.3) saturate(0.8) brightness(1.3) hue-rotate(8deg)",   // Fresh parchment
        "sepia(0.8) saturate(1.1) brightness(1.0) hue-rotate(-3deg)",  // Neutral aged
        "sepia(0.6) saturate(1.4) brightness(1.1) hue-rotate(22deg)",  // Tea-stained
        "sepia(0.4) saturate(1.0) brightness(1.25) hue-rotate(15deg)", // Light vintage
        "sepia(0.7) saturate(1.3) brightness(0.98) hue-rotate(28deg)", // Coffee-toned
    ];

    const fragmentTextures = [
        "/images/paper-textures/PaperTexture1.jpg",
        "/images/paper-textures/PaperTexture2.jpg",
        "/images/paper-textures/PaperTexture3.jpg",
        "/images/paper-textures/PaperTexture4.jpg",
        "/images/paper-textures/PaperTexture5.jpg",
    ];

    const cardColor = useMemo(() => {
        return fragmentColors[Math.floor(Math.random() * fragmentColors.length)];
    }, []);

    const selectedTexture = useMemo(() => {
        return fragmentTextures[Math.floor(Math.random() * fragmentTextures.length)];
    }, []);

    const textureFlip = useMemo(() => {
        const flipX = Math.random() < 0.5 ? -1 : 1;
        const flipY = Math.random() < 0.5 ? -1 : 1;

        return `scaleX(${flipX}) scaleY(${flipY})`
    }, []);

    const preview = 
        dream.content.length > truncateAt
            ? dream.content.slice(0, truncateAt) + "..."
            : dream.content;

    return (
        <div
            style={{ 
                ...baseStyle, 
                ...style 
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.35)")
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.25)")
            }
            onClick={onOpen}
        >
            {/* Background layer with filter applied */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "#808080",
                    borderRadius: 12,
                    filter: cardColor, // Apply filter here instead
                    zIndex: 1, // Behind content
                }}
            />
            
            {/* Texture layer */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${selectedTexture})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: 12,
                    mixBlendMode: "overlay",
                    opacity: 0.8,
                    pointerEvents: "none",
                    transform: textureFlip,
                    transformOrigin: "center",
                    zIndex: 2, // Above background, below content
                }}
            />

            {/* Content layer - appears above everything */}
            <div 
                style={{ 
                    position: "relative", 
                    zIndex: 3, // Above all background layers
                    height: "100%",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <h3 className="font-bold mb-1">{dream.title}</h3>
                <Typography className="text-xs text-gray-600 mb-2">
                    <Link href={`/profile/${dream.user}`}>
                        By {dream.user?.username || "Unknown"}
                    </Link>
                </Typography>
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
                    onClick={(e) => e.stopPropagation()}
                >
                    <FavoriteHeart 
                        isFavorited={isFavorited} 
                        canFavorite={canFavorite} 
                        onToggle={onToggleFavorite} 
                        static={true} 
                    />
                </div>
            </div>
        </div>
    );
}