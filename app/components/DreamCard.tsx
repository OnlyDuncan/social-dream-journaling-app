"use client";

import { ReactNode, useState, useMemo } from "react";
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

const svgPaths = [
    "/images/dream-cards/Fragment1.svg",
    "/images/dream-cards/Fragment2.svg",
    "/images/dream-cards/Fragment3.svg",
    "/images/dream-cards/Fragment4.svg",
    "/images/dream-cards/Fragment5.svg",
    "/images/dream-cards/Fragment6.svg",
    "/images/dream-cards/Fragment7.svg",
    "/images/dream-cards/Fragment8.svg",
    "/images/dream-cards/Fragment9.svg",
    "/images/dream-cards/Fragment10.svg",
    "/images/dream-cards/Fragment11.svg",
    "/images/dream-cards/Fragment12.svg",
    "/images/dream-cards/Fragment13.svg",
];

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

function seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash) / 2147483647;
}

function generateSeededValues(dreamId: string) {
    const baseRandom = seededRandom(dreamId);
    const colorRandom = seededRandom(dreamId + 'color');
    const rotationRandom = seededRandom(dreamId + 'rotation');
    const scaleRandom = seededRandom(dreamId + 'scale');
    const flipXRandom = seededRandom(dreamId + 'flipX');
    const flipYRandom = seededRandom(dreamId + 'flipY');
    const pathRandom = seededRandom(dreamId + 'path');

    return {
        baseRandom,
        colorRandom,
        rotationRandom,
        scaleRandom,
        flipXRandom,
        flipYRandom,
        pathRandom,
    };
}

export default function DreamCard({ 
    dream,
    isFavorited,
    onToggleFavorite,
    onOpen,
    style,
    truncateAt = 220,
}: DreamCardProps) {
    const background = useMemo(() => {
        const randoms = generateSeededValues(dream.id);
        
        const path = svgPaths[Math.floor(randoms.pathRandom * svgPaths.length)];
        const flipX = randoms.flipXRandom < 0.5 ? -1 : 1;
        const flipY = randoms.flipYRandom < 0.5 ? -1 : 1;
        const scale = 1.2 + randoms.scaleRandom * 0.3;
        
        const colorFilter = fragmentColors[Math.floor(randoms.colorRandom * fragmentColors.length)];

        return { path, flipX, flipY, scale, colorFilter };
    }, [dream.id]);

    const preview = 
        dream.content.length > truncateAt
            ? dream.content.slice(0, truncateAt) + "..."
            : dream.content;

    return (
        <div
            style={{
                position: "absolute",
                width: 240,
                maxHeight: 320,
                ...style,
            }}
            onClick={onOpen}
        >
            <img
                src={background.path}
                alt=""
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${background.scale}) scaleX(${background.flipX}) scaleY(${background.flipY})`,
                    filter: background.colorFilter,
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    padding: "25px 20px",
                    height: "100%",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <div style={{ flexShrink: 0, marginBottom: "12px" }}>
                    <h3 className="font-bold mb-1 text-center text-sm leading-tight">{dream.title}</h3>
                    <h2 className="text-xs text-gray-600 text-center">
                        By {dream.user?.username || "Unknown"}
                    </h2>
                </div>

                <div 
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        marginBottom: "12px",
                        paddingRight: "4px",
                        wordWrap: "break-word",
                        hyphens: "auto",
                    }}
                    className="prose prose-xs max-w-none"
                >
                    <div style={{ 
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.4,
                    }}>
                        <ReactMarkdown>{preview}</ReactMarkdown>
                    </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                    <p className="text-[9px] text-gray-600 text-center mb-2">
                        Tags: {" "}
                        {dream.tags?.length
                            ? dream.tags.map((t) => t.name).join(", ")
                            : "No Tags"}
                    </p>
                    {/* <div className="flex justify-center">
                        <FavoriteHeart
                            isFavorited={isFavorited}
                            onToggle={onToggleFavorite}
                            static={true}
                        />
                    </div> */}
                </div>
            </div>
        </div>
    );
}