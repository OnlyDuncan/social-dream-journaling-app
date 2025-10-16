"use client";

// Make sure Dreams don't cover anything important
// Make it so hearting a Dream does not trigger the modal, and add heart to modal of Dream
// Make it so that clicking on the username of a user in the modal takes you to that user's page
// Add private option to Dream creation modal
// After styling make functional on mobile devices
// Add swipe gestures for mobile

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import UniversalUserSearch from "../components/UniversalUserSearch";
import UniversalDreamSearch from "../components/UniversalDreamSearch";
import { Box } from "@mui/material";
import DreamModal from "../components/DreamModal";
import CreateDreamModal from "../components/CreateDreamModal";
import DreamCard from "../components/DreamCard";

type Tag = { id: string; name: string; };
type Note = {
  id: string;
  user: { username: string };
  title: string;
  content: string;
  tags: Tag[];
};
type Favorite = Note;

export default function Feed() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showCreate, setShowCreate] = useState(false); // controls create modal/form
  const [hasSearchResults, setHasSearchResults] = useState(false);

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
              <UniversalUserSearch />

              {/* Pass callback to search component */}
              <UniversalDreamSearch 
                onSearchStateChange={setHasSearchResults}
              />

              {/* Only show main feed if no search results */}
              {!hasSearchResults && (
                <Box
                  sx={{
                    position: 'relative',
                    height: 1000,
                    backgroundColor: "#A5D0D0",
                    mb: 4,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    border: '2px solid #ccc'
                  }}
                >
                  <br />
                  {notes.length > 0 ? (
                    notes.map(note => {
                      const { top, left, rotate, z } = getPos(note.id);
                      return (
                        <DreamCard
                          key={note.id}
                          dream={note}
                          isFavorited={favoriteIds.has(note.id)}
                          onToggleFavorite={() => toggleFavorite(note.id, favoriteIds.has(note.id))}
                          onOpen={() => setSelectedNote(note)}
                          style={{
                            position: "absolute",
                            top: `${top}%`,
                            left: `${left}%`,
                            transform: `rotate(${rotate}deg)`,
                            zIndex: z,
                          }}
                        />
                      );
                    })
                  ) : (
                    <p style={{ padding: 16 }}>No notes found.</p>
                  )}
                </Box>
              )}

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