"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import FavoriteHeart from "../components/HeartButton";
import UniversalSearch from "../components/UniversalSearch";

type Tag = {
    id: string;
    name: string;
};

type Note = {
    id: string;
    user: {
        username: string;
    };
    title: string;
    content: string;
    tags: Tag[];
};

type Favorite = Note;

type FavoritesResponse = {
    favoriteNotes: Favorite[];
};

export default function Feed({ user, isOwnProfile }: { user: any; isOwnProfile: boolean }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    useEffect(() => {
        fetch('/api/feed')
            .then((res) => res.json())
            .then((data) => {
                console.log('Fetched Notes:', data);
                setNotes(data);
            });
    }, []);

    useEffect(() => {
        async function fetchMyFavorites() {
            const res = await fetch("/api/favorites");
            if (res.ok) {
                const data = await res.json();
                setFavoriteIds(new Set(data.map((fav: Favorite) => fav.id)));
            }
        }

        fetchMyFavorites();
    }, []);

    async function toggleFavorite(noteId: string, currentlyFavorited: boolean) {
        try {
            const res = await fetch("/api/favorites", {
                method: currentlyFavorited ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId }),
            });

            if (!res.ok) {
                throw new Error("Failed to update favorite");
            }

            const updatedFavorites: Favorite[] = await res.json();
            setFavorites(updatedFavorites);
            setFavoriteIds(new Set(updatedFavorites.map(fav => fav.id)));
        } catch (error) {
            console.error(error);
        }
    }

    async function handleAddNote() {
        const tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean)

        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, tags: tagsArray }),
        })

        if (res.ok) {
            const newNote = await res.json()
            setNotes((prev) => [...prev, newNote])
            setTitle('')
            setContent('')
            setTags('')
        }
    }

   return (
    <main className="p-4">
      <SignedOut>
        <p>You are signed out.</p>
        <Link href="/sign-in" className="text-blue-600 underline">
          Sign in
        </Link>
      </SignedOut>

      <SignedIn>
        <UserButton />
        <div className="mt-4">
            <UniversalSearch />
            <div className="mb-6">
                <div className="bg-pink-900 p-4">
                    <input
                    className="border rounded p-2 w-full mb-2"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <textarea
                    className="border rounded p-2 w-full mb-2"
                    placeholder="Content (Markdown supported)"
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <input
                    className="border rounded p-2 w-full"
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
                <button
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={handleAddNote}
                >
                    Add Note
                </button>
            </div>
            
            <section>
                {Array.isArray(notes) && notes.length > 0 ? (
                    notes.map(({ id, user, title, content, tags }) => (
                        <article key={id} className="border-b py-4">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Posted by{" "}
                                    {user?.username ? (
                                        <Link href={`/profile/${user.username}`} className="text-blue-600 underline">
                                            {user.username}
                                        </Link>
                                    ) : (
                                        "Unknown"
                                    )}
                                </h2>
                                <h2 className="text-xl font-semibold">{title}</h2>
                                <ReactMarkdown>{content}</ReactMarkdown>
                                <p className="text-sm text-gray-500 mt-2">
                                    Tags: {tags ? tags.map(tag => tag.name).join(', ') : 'No Tags'}
                                </p>
                            </div>
                            <div className="ml-4">
                                <FavoriteHeart
                                    isFavorited={favoriteIds.has(id)}
                                    onToggle={() => toggleFavorite(id, favoriteIds.has(id))}
                                />
                            </div>
                        </article>
                    ))
                ) : (
                    <p>No notes found.</p>
                )}
            </section>
            <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Home
            </Link>
        </div>
      </SignedIn>
    </main>
  );
}