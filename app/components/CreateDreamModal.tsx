"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box } from "@mui/material";

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

    const { userId } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [publicCount, setPublicCount] = useState(0);
    const [privateCount, setPrivateCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [limitType, setLimitType] = useState<'50 public' | '50 private' | 'both 50 public and 50 private' | null>(null);

    useEffect(() => {
        async function fetchUserDreamCounts() {
            try {
                const res = await fetch('/api/notes?userId=' + encodeURIComponent(userId || ''));
                if (res.ok) {
                    const dreams = await res.json();
                    const publicDreams = dreams.filter((dream: any) => !dream.isPrivate);
                    const privateDreams = dreams.filter((dream: any) => dream.isPrivate);
                    setPublicCount(publicDreams.length);
                    setPrivateCount(privateDreams.length);
                } else {
                    console.error('Failed to fetch dream counts:', res.status);
                }
            } catch (error) {
                console.error('Error fetching dream counts:', error);
            } finally {
                setLoading(false);
            }
        }

        if (isOpen) {
            fetchUserDreamCounts();
        }
    }, [isOpen]);

    const canCreatePublic = publicCount < 1;
    const canCreatePrivate = privateCount < 1;

    if (!canCreatePublic) {
        setLimitType('50 public');
    } else if (!canCreatePrivate) {
        setLimitType('50 private');
    } else if (!canCreatePublic && !canCreatePrivate) {
        setLimitType('both 50 public and 50 private');
    }

    async function handleCreateDream() {
        const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        
        if (isPrivate && privateCount >= 45) {
            alert(`You are approaching the limit for private dreams (${privateCount}/50). Please consider removing some dreams before creating more.`)
        }
        if (isPrivate && privateCount >= 50) {
            alert(`You have reached the limit for private dreams. Please delete some dreams before creating more.`);
            return;
        }
        if (!isPrivate && publicCount >= 1) {
            alert(`You are approaching the limit for public dreams (${publicCount}/50). Please consider removing some dreams before creating more.`);
        }
        if (!isPrivate && publicCount >= 50) {
            alert(`You have reached the limit for public dreams. Please delete some dreams before creating more.`);
            return;
        }

        const res = await fetch('/api/notes', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, tags: tagsArray, isPrivate }),
        });
        if (res.ok) {
            const newDream = await res.json();
            onDreamCreated(newDream);
            setTitle("");
            setContent("");
            setTags("");
            setIsPrivate(false);
            onClose();
        }
    }

    return (
        <Box className="mb-6 z-50 fixed inset-0 flex flex-col items-center justify-center bg-black/50 p-4" style={{ zIndex: 2001 }}>
            {canCreatePublic || canCreatePrivate ? (
                <Box>
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
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="mr-2"
                            checked={isPrivate}
                            onChange={e => setIsPrivate(e.target.checked)}
                        />
                        Private
                    </label>

                    <div className="flex justify-end space-x-2">
                        <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className={`px-4 py-2 text-white rounded ${
                                loading ? 'bg-gray-400 cursor-wait' :
                                (isPrivate ? !canCreatePrivate : !canCreatePublic) ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            onClick={handleCreateDream}
                            disabled={loading || (isPrivate ? !canCreatePrivate : !canCreatePublic)}
                        >
                            {loading ? 'Loading...' :
                            isPrivate ? 
                                (!canCreatePrivate ? `Private limit reached (${privateCount}/50)` : 'Create Dream') :
                                (!canCreatePublic ? `Public limit reached (${publicCount}/50)` : 'Create Dream')
                            }
                        </button>
                    </div>
                </Box>
            ) : (
                <div className="bg-white p-6 rounded shadow-md text-center">
                    <h2 className="text-xl font-semibold mb-4">Dream Creation Limit Reached</h2>
                    <p className="mb-4">You have reached the maximum limit of `{limitType}` dreams. Please delete some dreams before creating new ones.</p>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            )}
        </Box>
    );
}