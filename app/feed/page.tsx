"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import FavoriteHeart from "../components/HeartButton";
import UniversalSearch from "../components/UniversalSearch";
import { Box } from "@mui/material";
import DreamModal from "../components/DreamModal";
import CreateDreamModal from "../components/CreateDreamModal";

type Tag = { id: string; name: string; };
type Note = {
  id: string;
  user: { username: string };
  title: string;
  content: string;
  tags: Tag[];
};
type Favorite = Note;

export default function Feed({ user, isOwnProfile }: { user: any; isOwnProfile: boolean }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showCreate, setShowCreate] = useState(false); // controls create modal/form

  useEffect(() => {
    fetch('/api/feed')
      .then(r => r.json())
      .then(d => setNotes(d));
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavoriteIds(new Set(data.map((fav: Favorite) => fav.id)));
      }
    })();
  }, []);

  async function toggleFavorite(noteId: string, currentlyFavorited: boolean) {
    try {
      const res = await fetch("/api/favorites", {
        method: currentlyFavorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      if (!res.ok) return;
      const updated: Favorite[] = await res.json();
      setFavoriteIds(new Set(updated.map(f => f.id)));
    } catch (e) {
      console.error(e);
    }
  }

  const positionKey = useMemo(() => notes.map(n => n.id).join('|'), [notes]);

  const positions = useMemo(() => {
    // Generate one random position per note (stable until notes list changes)
    const arr = notes.map(n => {
      return {
        id: n.id,
        top: 5 + Math.random() * 80,     // percentages
        left: 5 + Math.random() * 80,
        rotate: (Math.random() - 0.5) * 14,
        z: Math.floor(Math.random() * 100),
      };
    });
    return arr;
    // Only regenerate when the set of IDs changes
  }, [positionKey]);

  // Helper to lookup position by note id
  function getPos(id: string) {
    return positions.find(p => p.id === id)!;
  }

  return (
    <main>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <Box sx={{ backgroundColor: "#8E7499", px: 2, pt: 2, height: "100%", boxSizing: "border-box" }}>
        <Box sx={{
          background: "linear-gradient(to bottom, #446E99 0%, #172533 69%)",
          p: 4,
          minHeight: "100vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column"
        }}>
          <SignedIn>
            <div className="mt-4">
              <UniversalSearch />

              {/* Single scatter container (random each render) */}
              <Box
                sx={{
                  position: 'relative',
                  height: 1000,
                  backgroundColor: "#A5D0D0",
                  mb: 4,
                  overflow: 'hidden',
                  border: '2px solid #ccc'
                }}
              >
                {notes.length > 0 ? (
                  notes.map(note => {
                    const { top, left, rotate, z } = getPos(note.id);
                    return (
                      <div
                        key={note.id}
                        style={{
                          position: 'absolute',
                          top: `${top}%`,
                          left: `${left}%`,
                          width: 240,
                          maxHeight: 320,
                          padding: '12px 14px',
                          background: '#ffffffee',
                          borderRadius: 12,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                          transform: `rotate(${rotate}deg)`,
                          zIndex: z,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          backdropFilter: 'blur(2px)',
                          transition: 'box-shadow 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.35)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.25)')}
                        onClick={() => setSelectedNote(note)}
                      >
                        <h3 className="font-bold mb-1">{note.title}</h3>
                        <h2 className="text-sm text-gray-600 mb-2">By {note.user?.username || 'Unknown'}</h2>
                        <div className="prose prose-sm max-w-none flex-1 overflow-auto mb-2">
                          <ReactMarkdown>
                            {note.content.length > 220 ? note.content.slice(0, 220) + '…' : note.content}
                          </ReactMarkdown>
                        </div>
                        <p className="text-[10px] text-gray-600">
                          Tags: {note.tags?.length ? note.tags.map(t => t.name).join(', ') : 'No Tags'}
                        </p>
                        <div className="mt-1">
                          <FavoriteHeart
                            isFavorited={favoriteIds.has(note.id)}
                            onToggle={() => toggleFavorite(note.id, favoriteIds.has(note.id))}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ padding: 16 }}>No notes found.</p>
                )}

              </Box>
            
              {selectedNote && (
                  <DreamModal
                    isOpen={true}
                    onClose={() => setSelectedNote(null)}
                    title={selectedNote.title}
                    content={selectedNote.content}
                    tags={selectedNote.tags.map(t => t.name)}
                    author={selectedNote.user?.username}
                />
            )}

              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Home
              </Link>
            </div>
          </SignedIn>
        </Box>
      </Box>

      {/* Floating Action Button (bottom-left) */}
      <button
        type="button"
        aria-label="Create Dream"
        onClick={() => setShowCreate(true)}
        className="fixed bottom-10 right-16 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white text-3xl font-semibold shadow-lg shadow-pink-900/40 transition-colors focus:outline-none focus:ring-4 focus:ring-pink-300"
      >
        +
      </button>

      {showCreate && (
        <CreateDreamModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onDreamCreated={note => setNotes(prev => [...prev, note])}
        />
      )}
    </main>
  );
}