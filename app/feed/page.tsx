"use client";

// Make sure Dreams don't cover anything important
// After styling make functional on mobile devices
// Add scalability and feed algorithm
// Add swipe gestures for mobile

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import DreamModal from "../components/DreamModal";
import CreateDreamModal from "../components/CreateDreamModal";
import DreamCard from "../components/DreamCard";
import UniversalSearch from "../components/UniversalSearch";
import WarningModal from "../components/WarningModal";

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
  const { userId: loggedInUserId } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  useEffect(() => {
    const ensureUserExists = async () => {
      if (loggedInUserId) {
        try {
          await fetch('/api/user/ensure-exists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: loggedInUserId }),
          });
        } catch (error) {
          console.error('Error ensuring user exists:', error);
        }
      }
    };
    
    ensureUserExists();
  }, [loggedInUserId]);

  // Fetches feed
  useEffect(() => {
    fetch('/api/feed')
      .then(r => r.json())
      .then(d => setNotes(d));
  }, []);

  // Fetches favorite dreams / favorite dream ids
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavoriteIds(new Set(data.map((fav: Favorite) => fav.id)));
      }
    })();
  }, []);

  // Function for toggling a dream as a favorite
  async function toggleFavorite(noteId: string, currentlyFavorited: boolean) {
    if (!currentlyFavorited && favoriteIds.size >= 50) {
      setShowLimitWarning(true);
      return;
    }

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

  async function handleDelete(noteId: string ) {
    try {
      const res = await fetch(`/api/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteId }),
      });

      if (res.ok) {
        console.log("Note deleted successfully");
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
        setSelectedNote(null);
      } else {
        console.error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  }

  const positionKey = useMemo(() => notes.map(n => n.id).join('|'), [notes]);

  const positions = useMemo(() => {
    const cardWidth = 240; // Your DreamCard width in pixels
    const cardHeight = 320; // Your DreamCard height in pixels
    const containerWidth = 1000; // Approximate container width
    const contentPadding = 25; // Padding inside your cards (from DreamCard style)
    
    // Calculate effective content area
    const contentWidth = cardWidth - (contentPadding * 2); // 190px
    const contentHeight = cardHeight - (contentPadding * 2); // 270px
    
    const arr = notes.map((n, index) => {
      const gridCols = 3;
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;
      
      // Space cards so content areas don't overlap, but edges can
      const horizontalSpacing = (contentWidth + 40) / containerWidth * 100; // 40px edge overlap allowance
      const verticalSpacing = (contentHeight + 30) / 1000 * 100; // 30px edge overlap allowance
      
      const baseLeft = 5 + (col * horizontalSpacing);
      const baseTop = 5 + (row * verticalSpacing);
      
      // Small random offset that won't cause content overlap
      const randomOffsetX = (Math.random() - 0.5) * 4; // ±2%
      const randomOffsetY = (Math.random() - 0.5) * 4; // ±2%
      
      return {
        id: n.id,
        top: Math.max(2, Math.min(85, baseTop + randomOffsetY)),
        left: Math.max(2, Math.min(85, baseLeft + randomOffsetX)),
        rotate: (Math.random() - 0.5) * 6, // Reduced rotation
        z: Math.floor(Math.random() * 100),
      };
    });
    return arr;
  }, [positionKey]);

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
          p: 9,
          minHeight: "100vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column"
        }}>
          <SignedIn>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <UniversalSearch 
                onSearchStateChange={setHasSearchResults}
                onSearchResults={setSearchResults}
              />
            </Box>
            <div className="mt-4">
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
                {hasSearchResults ? (
                  searchResults.length > 0 ? (
                    searchResults.map(note => {
                      const position = positions.find(p => p.id === note.id) || {
                        top: 5 + Math.random() * 80,
                        left: 5 + Math.random() * 80,
                        rotate: (Math.random() - 0.5) * 14,
                        z: Math.floor(Math.random() * 100),
                      };
                      return (
                        <DreamCard
                          key={note.id}
                          dream={note}
                          isFavorited={favoriteIds.has(note.id)}
                          onToggleFavorite={() => toggleFavorite(note.id, favoriteIds.has(note.id))}
                          onOpen={() => setSelectedNote(note)}
                          style={{
                            position: "absolute",
                            top: `${position.top}%`,
                            left: `${position.left}%`,
                            transform: `rotate(${position.rotate}deg)`,
                            zIndex: position.z,
                          }}
                        />
                      )
                    })
                  ) : (
                    <Typography sx={{ textAlign: 'center', mt: 4, color: '#666' }}>
                      No search results found
                    </Typography>
                  )
                ) : (
                  notes.length > 0 ? (
                    notes.map(note => {
                      const position = positions.find(p => p.id === note.id) || {
                        top: 5 + Math.random() * 80,
                        left: 5 + Math.random() * 80,
                        rotate: (Math.random() - 0.5) * 14,
                        z: Math.floor(Math.random() * 100),
                      };
                      return (
                        <DreamCard
                          key={note.id}
                          dream={note}
                          isFavorited={favoriteIds.has(note.id)}
                          onToggleFavorite={() => toggleFavorite(note.id, favoriteIds.has(note.id))}
                          onOpen={() => setSelectedNote(note)}
                          style={{
                            position: "absolute",
                            top: `${position.top}%`,
                            left: `${position.left}%`,
                            transform: `rotate(${position.rotate}deg)`,
                            zIndex: position.z,
                          }}
                        />
                      );
                    })
                  ) : (
                    <Typography sx={{ textAlign: 'center', mt: 4, color: '#666' }}>
                      No dreams to display
                    </Typography>
                  )
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
                  isFavorited={favoriteIds.has(selectedNote.id)}
                  onToggleFavorite={() => toggleFavorite(selectedNote.id, favoriteIds.has(selectedNote.id))}
                  handleDelete={() => handleDelete(selectedNote.id)}
                  canFavorite={favoriteIds.size < 50}
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
      
      {/* Displays create dreams button / modal and warning modal */}
      <button
        type="button"
        aria-label="Create Dream"
        onClick={() => setShowCreate(true)}
        className="fixed bottom-10 right-16 flex items-center justify-center w-14 h-14 rounded-full bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white text-3xl font-semibold shadow-lg shadow-pink-900/40 transition-colors focus:outline-none focus:ring-4 focus:ring-pink-300"
        style={{ zIndex: 9998 }}
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

      <WarningModal
        isOpen={showLimitWarning}
        onClose={() => setShowLimitWarning(false)}
      />
        
    </main>
  );
}