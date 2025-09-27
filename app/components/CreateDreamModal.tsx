"use client";

import { ReactNode, useState } from "react";

type DreamModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    tags: string[];
    author?: string;
};

export default function CreateDreamModal({ 
    isOpen, 
    onClose, 
    title, 
    content, 
    tags, 
    author 
}: DreamModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                {author && <p className="text-sm text-gray-600 mb-4">By {author}</p>}
                <p className="text-gray-800 whitespace-pre-line">{content}</p>
                {tags.length > 0 && (
                    <p className="text-xs text-gray-500 mt-4">
                        Tags: {tags.join(", ")}
                    </p>
                )}
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );
}