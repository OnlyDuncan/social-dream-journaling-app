"use client";

import { useState, useEffect, useMemo } from 'react';
import DreamCard from './DreamCard';
import DreamModal from './DreamModal';
import { Box } from "@mui/material";

type Tag = { id: string; name: string; };
type Note = {
  id: string;
  user: { username: string };
  title: string;
  content: string;
  tags: Tag[];
};

type Favorite = Note;

interface SearchResult {
  notes?: Array<{
    id: string;
    title: string;
    content: string;
    user: { username: string };
    tags: Array<{ name: string }>;
  }>;
}

interface UniversalDreamSearchProps {
  onSearchStateChange?: (hasResults: boolean) => void;
}

export default function UniversalSearch({ onSearchStateChange }: UniversalDreamSearchProps = {}) {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState('');
  const [searchType, setSearchType] = useState<'users' | 'notes' | 'both'>('both');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [results, setResults] = useState<SearchResult>({});
  const [isLoading, setIsLoading] = useState(false);

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

  async function handleSearch() {
    if (!query.trim() && !tags.trim()) {
      setResults({});
      onSearchStateChange?.(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (tags.trim()) params.set('tags', tags.trim());
      params.set('type', searchType);

      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        onSearchStateChange?.(data.notes && data.notes.length > 0);
      }
    } catch (error) {
      console.error('Search failed:', error);
      onSearchStateChange?.(false);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setQuery('');
    setTags('');
    setResults({});
    setSelectedNote(null);
    onSearchStateChange?.(false);
  }

  // Add positioning logic (same as feed)
  const positionKey = useMemo(() => results.notes?.map(n => n.id).join('|') || '', [results.notes]);

  const positions = useMemo(() => {
    if (!results.notes) return [];
    return results.notes.map(n => ({
      id: n.id,
      top: 5 + Math.random() * 80,
      left: 5 + Math.random() * 80,
      rotate: (Math.random() - 0.5) * 14,
      z: Math.floor(Math.random() * 100),
    }));
  }, [positionKey]);

  function getPos(id: string) {
    return positions.find(p => p.id === id) || { top: 50, left: 50, rotate: 0, z: 1 };
  }

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by tags (comma-separated)..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      <div>
        
        {results.notes && results.notes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Dreams</h3>
            {/* Add positioned container like in feed */}
            <Box
              sx={{
                position: 'relative',
                height: 600,
                backgroundColor: "#A5D0D0",
                mb: 4,
                overflow: 'hidden',
                border: '2px solid #ccc'
              }}
            >
              {results.notes.map(note => {
                const { top, left, rotate, z } = getPos(note.id);
                return (
                  <DreamCard
                    key={note.id}
                    dream={note}
                    isFavorited={favoriteIds.has(note.id)}
                    onToggleFavorite={() => toggleFavorite(note.id, favoriteIds.has(note.id))}
                    onOpen={() => setSelectedNote({
                      ...note,
                      tags: note.tags.map((t, idx) => ({
                        id: `${note.id}-tag-${idx}`,
                        name: t.name
                      }))
                    })}
                    style={{
                      position: "absolute",
                      top: `${top}%`,      // Now properly interpolated
                      left: `${left}%`,    // Now properly interpolated
                      transform: `rotate(${rotate}deg)`,  // Now properly interpolated
                      zIndex: z,
                    }}
                  />
                );
              })}
            </Box>

            {selectedNote && (
              <DreamModal
                isOpen={true}
                onClose={() => setSelectedNote(null)}
                title={selectedNote.title}
                content={selectedNote.content}
                tags={selectedNote.tags.map(t => t.name)}
                author={selectedNote.user?.username} 
                canFavorite={favoriteIds.size < 1}
                onToggleFavorite={() => toggleFavorite(selectedNote.id, favoriteIds.has(selectedNote.id))}         
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}