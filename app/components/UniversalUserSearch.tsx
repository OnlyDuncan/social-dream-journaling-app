"use client";

import { useState } from 'react';
import { Box } from "@mui/material";

interface SearchResult {
  users?: Array<{ id: string; username: string }>;
}

export default function UniversalSearch() {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState('');
  const [searchType, setSearchType] = useState<'users' | 'notes' | 'both'>('both');
  const [results, setResults] = useState<SearchResult>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim() && !tags.trim()) return;

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
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box className="max-w-2xl mx-auto p-4">
      <Box className="mb-4" sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "stretch" }}>
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 border rounded"
          style={{ height: '44px' }}
        />

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 bg-blue-600 text-white rounded disabled:bg-gray-400"
          style={{ height: '44px', minWidth: '100px' }}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </Box>

      <Box>
        {results.users && results.users.length > 0 && (
          <Box className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            {results.users.map(user => (
              <Box key={user.id} className="p-2 border-b">
                <a href={`/profile/${user.username}`} className="text-blue-600 hover:underline">
                  @{user.username}
                </a>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}