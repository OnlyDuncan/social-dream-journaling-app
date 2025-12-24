"use client";

import { ReactNode, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import FavoriteHeart from "./HeartButton";
import Link from "next/link";
import Typography from "@mui/material/Typography";

type WarningModalProps = {
    isOpen: boolean;
    onClose: () => void;
    // limitType: 'favorites' | 'public' | 'private' | null;
    // warningType: 'warning' | 'limit' | null;
};

export default function WarningModal({ 
    isOpen, 
    onClose, 
    // limitType,
    // warningType
}: WarningModalProps) {

    if (!isOpen) return null;

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

                <Typography className="prose prose-lg max-w-none mb-6">
                    You have reached the limit for favorited dreams. Please unfavorite some dreams before favoriting more.
                    {/* {limitType === 'favorites' && warningType === 'warning' && (
                        <ReactMarkdown>{`You are approaching the limit for favorited dreams. Please consider unfavoriting some dreams before favoriting more.`}</ReactMarkdown>
                    )} */}
                    {/* {limitType === 'favorites' && warningType === 'limit' && (
                        <ReactMarkdown>{`You have reached the limit for favorited dreams. Please unfavorite some dreams before favoriting more.`}</ReactMarkdown>
                    )} */}
                    {/* {limitType === 'public' && warningType === 'warning' && (
                        <ReactMarkdown>{`You are approaching the limit for public dreams. Please consider removing some dreams before creating more.`}</ReactMarkdown>
                    )}
                    {limitType === 'public' && warningType === 'limit' && (
                        <ReactMarkdown>{`You have reached the limit for public dreams. Please remove some dreams before creating more.`}</ReactMarkdown>
                    )}
                    {limitType === 'private' && warningType === 'warning' && (
                        <ReactMarkdown>{`You are approaching the limit for private dreams. Please consider removing some dreams before creating more.`}</ReactMarkdown>
                    )}
                    {limitType === 'private' && warningType === 'limit' && (
                        <ReactMarkdown>{`You have reached the limit for private dreams. Please remove some dreams before creating more.`}</ReactMarkdown>
                    )} */}
                </Typography>


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