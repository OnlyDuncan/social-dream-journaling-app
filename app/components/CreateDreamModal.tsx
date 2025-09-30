"use client";

import { ReactNode, useState } from "react";

type CreateDreamModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onDreamCreated: (note: any) => void;
};

export default function CreateDreamModal({ 
    isOpen, 
    onClose, 
    onDreamCreated 
}: CreateDreamModalProps) {
    if (!isOpen) return null;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    async function handleCreateDream() {
        const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);

        const res = await fetch('/api/notes', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, tags: tagsArray }),
        });
        if (res.ok) {
            const newDream = await res.json();
            onDreamCreated(newDream);
            setTitle("");
            setContent("");
            setTags("");
            onClose();
        }
    }

    return (
        <div className="mb-6 z-50 fixed inset-0 flex flex-col items-center justify-center bg-black/50 p-4" style={{ zIndex: 2001 }}>
            <div className="bg-pink-900 p-4">
                <input
                    className="border rounded p-2 w-full mb-2"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </div>
            <textarea
                className="border rounded p-2 w-full mb-2"
                placeholder="Content (Markdown supported)"
                rows={6}
                value={content}
                onChange={e => setContent(e.target.value)}
            />
            <input
                className="border rounded p-2 w-full"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={e => setTags(e.target.value)}
            />

            <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={handleCreateDream}
                >
                    Create Dream
                </button>
            </div>
        </div>
    );
}