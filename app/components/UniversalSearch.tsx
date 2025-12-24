"use client";

import { useState, useEffect, useMemo } from 'react';
import { Box, FormControl, Link, InputLabel, Typography, Select, MenuItem } from "@mui/material";
import DreamModal from './DreamModal';

export type Note = {
  id: string;
  user: { username: string };
  title: string;
  content: string;
  tags: { id: string; name: string }[];
};

interface SearchResult {
  users?: Array<{ id: string; username: string }>;
  notes?: Array<Note>;
};

type SearchMode = 'users' | 'dreams' | 'tags';

interface UniversalSearchProps {
  onSearchStateChange?: (hasResults: boolean) => void;
  onSearchResults?: (results: Note[]) => void;
};

export default function UniversalSearch({
    onSearchStateChange,
    onSearchResults
}: UniversalSearchProps = {}) {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('dreams');
  const [results, setResults] = useState<SearchResult>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Dream-specific state
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Fetch favorites for dream/tags search
  useEffect(() => {
    if (searchMode === 'dreams' || searchMode === 'tags') {
      (async () => {
        try {
          const res = await fetch('/api/favorites');
          if (res.ok) {
            const data: Note[] = await res.json();
            setFavoriteIds(new Set(data.map(n => n.id)));
          }
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [searchMode]);

  async function handleSearch() {
    if (!query.trim() && !tags.trim()) {
      setResults({});
      // Only clear feed for dream/tag searches
      if (searchMode === 'dreams' || searchMode === 'tags') {
        onSearchStateChange?.(false);
        onSearchResults?.([]);
      }
      return;
    }

    setIsLoading(true);
    setResults({});
    
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (tags.trim()) params.set('tags', tags.trim());
      
      // Set search type based on mode
      if (searchMode === 'users') {
        params.set('type', 'users');
      } else if (searchMode === 'tags') {
        // For tags mode, search notes but prioritize tag matching
        params.set('type', 'notes');
        if (!tags.trim() && query.trim()) {
          // If no tags specified but query exists, treat query as tag search
          params.set('tags', query.trim());
          params.delete('q');
        }
      } else {
        params.set('type', 'notes');
      }

      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        const hasResults = (searchMode === 'users' && data.users?.length > 0) || 
                          ((searchMode === 'dreams' || searchMode === 'tags') && data.notes?.length > 0);
        
        // Only notify about search state for dream/tag searches that affect the feed
        if (searchMode === 'dreams' || searchMode === 'tags') {
          onSearchStateChange?.(data.notes?.length > 0 || false);
          onSearchResults?.(data.notes || []);
        } else {
          // For user searches, don't affect the feed display
          onSearchStateChange?.(false);
          onSearchResults?.([]);
        }
      } else {
        setResults({});
        onSearchStateChange?.(false);
        onSearchResults?.([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults({});
      onSearchStateChange?.(false);
      onSearchResults?.([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setQuery('');
    setTags('');
    setResults({});
    setSelectedNote(null);
    // Only clear feed if we were showing search results
    if (searchMode === 'dreams' || searchMode === 'tags') {
      onSearchStateChange?.(false);
      onSearchResults?.([]);
    }
  }

  async function toggleFavorite(noteId: string, currentlyFavorited: boolean) {
    try {
      const res = await fetch('/api/favorites', {
        method: currentlyFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId })
      });
      if (!res.ok) return;
      const updated: Note[] = await res.json();
      setFavoriteIds(new Set(updated.map(n => n.id)));
    } catch (e) {
      console.error(e);
    }
  }

  // Positioning logic for dream cards (similar to feed)
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
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      position: "relative",
      width: "100%",
      margin: 0,
      padding: 0
    }}>
      {/* Header Row with Logo, Text, and Search Controls */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
        alignItems: { xs: "stretch", sm: "center" }, 
        justifyContent: { xs: "flex-start", sm: "space-between" },
        width: "100%",
        mb: 2,
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{
          display: "flex", 
          alignItems: "center",
          gap: 2,
          justifyContent: { xs: "center", sm: "flex-start" }
        }}>
          <Link href="/">
            <img src="/images/Logo.svg" alt="Reverie Logo" style={{ height: 85, transform: "translateY(-10px)"}} />
          </Link>
          <Typography sx={{
            color: "white",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            textAlign: { xs: "center", sm: "left" },
            display: { xs: "none", lg: "block" },
            textWrap: "none",
          }}>
            Hearts are like open graves
          </Typography>
        </Box>
        
        {/* Search Controls */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 2 }, 
          alignItems: "stretch",
          width: { xs: "100%", sm: "auto" }
        }}>
          <FormControl size="small" sx={{ 
            minWidth: { xs: "100%", sm: 120 },
            width: { xs: "100%", sm: "auto" }
          }}>
            <Select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as SearchMode)}
              displayEmpty
              sx={{
                height: '44px',
                border: '1px solid #ccc',
                borderRadius: 0,
                backgroundColor: '#9DF6EE',
                width: "100%",
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiSelect-select': {
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                }
              }}
            >
              <MenuItem value="dreams">Dreams</MenuItem>
              <MenuItem value="tags">Tags</MenuItem>
              <MenuItem value="users">Users</MenuItem>
            </Select>
          </FormControl>

          <input
            type="text"
            placeholder={
              searchMode === 'users' ? "Search users..." : 
              searchMode === 'tags' ? "Search by tags..." : 
              "Search dreams..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-3 border"
            style={{ 
              height: '44px', 
              minWidth: '200px',
              width: '100%',
              maxWidth: '100%'
            }}
          />

          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            width: { xs: "100%", sm: "auto" }
          }}>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 text-white disabled:bg-gray-400"
              style={{ 
                height: '44px', 
                minWidth: '100px', 
                backgroundColor: "#070635",
                width: '100%'
              }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>

            <button
              onClick={handleClear}
              className="px-4 bg-gray-500 text-white hover:bg-gray-600"
              style={{ 
                height: '44px',
                width: '100%'
              }}
            >
              Clear
            </button>
          </Box>
        </Box>
      </Box>

      {/* Results Section - Below the search controls */}
      <Box>
        {isLoading && (
          <p className="text-center py-4 text-white">Searching {searchMode}...</p>
        )}
        
        {!isLoading && searchMode === 'users' && results.users && results.users.length === 0 && (
          <p className="text-center py-4 text-gray-400">No users found.</p>
        )}

        {!isLoading && searchMode === 'dreams' && results.notes && results.notes.length === 0 && (
          <p className="text-center py-4 text-gray-400">No dreams found.</p>
        )}

        {!isLoading && searchMode === 'tags' && results.notes && results.notes.length === 0 && (
          <p className="text-center py-4 text-gray-400">No dreams with those tags found.</p>
        )}
        
        {/* User Results - Displayed below search controls */}
        {searchMode === 'users' && results.users && results.users.length > 0 && (
          <Box sx={{ 
            mt: 2, 
            backgroundColor: "#1A2B3B", 
            width: "100%", 
            height: { xs: "250px", sm: "325px" },
            overflowY: "auto", 
            p: { xs: 1, sm: 2 },
            borderRadius: 1 
          }}>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Users ({results.users.length} found)
            </h3>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, sm: 2 }, overflowY: "auto" }}>
              {results.users.map(user => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                    <Box
                        className="p-3 shadow-md hover:shadow-lg transition-shadow"
                        sx={{ 
                            width: "100%",
                            backgroundColor: "#ABF2FF",
                            borderRadius: 1,
                            textAlign: 'left',
                            fontSize: { xs: "0.9rem", sm: "1rem" }
                        }}
                    >
                        @{user.username}
                    </Box>
                </Link>
              ))}
            </Box>
          </Box>
        )}
        
        {/* Dream/Tags Results Info */}
        {(searchMode === 'dreams' || searchMode === 'tags') && results.notes && results.notes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <h3 className="text-lg font-semibold mb-2 text-white">
              {searchMode === 'dreams' ? 'Dreams' : 'Dreams with Tags'} ({results.notes.length} found)
            </h3>
          </Box>
        )}
      </Box>

      {/* Dream Modal */}
      {selectedNote && (
        <DreamModal
          isOpen={true}
          onClose={() => setSelectedNote(null)}
          title={selectedNote.title}
          content={selectedNote.content}
          tags={selectedNote.tags.map((t: any) => t.name)}
          author={selectedNote.user?.username}
          isFavorited={favoriteIds.has(selectedNote.id)}
          onToggleFavorite={() => toggleFavorite(selectedNote.id, favoriteIds.has(selectedNote.id))}
          canFavorite={favoriteIds.size < 1}
        />
      )}
    </Box>
  );
}
