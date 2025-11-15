"use client";

import { useState } from 'react';

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
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div>
        {results.users && results.users.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            {results.users.map(user => (
              <div key={user.id} className="p-2 border-b">
                <a href={`/profile/${user.username}`} className="text-blue-600 hover:underline">
                  @{user.username}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}