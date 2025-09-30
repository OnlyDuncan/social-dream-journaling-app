"use client";
import { Plus } from "lucide-react";

type CreateDreamButtonProps = {
    onClick: () => void;
    label?: string;
};

export function CreateDreamButton({ onClick, label = "Create Dream" }: CreateDreamButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="
                fixed bottom-6 left-6 z-50
                flex items-center justify-center
                w-14 h-14 rounded-full
                bg-pink-600 hover:bg-pink-500 active:bg-pink-700
                text-white text-3xl font-semibold
                shadow-lg shadow-pink-900/40
                transition-colors
                focus:outline-none focus:ring-4 focus:ring-pink-300
            "
        >
            <Plus className="w-7 h-7" />
        </button>
    );
}