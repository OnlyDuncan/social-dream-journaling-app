"use client";

import { useState } from 'react';

interface SearchResult {
  notes?: Array<{
    id: string;
    title: string;
    content: string;
    user: { username: string };
    tags: Array<{ name: string }>;
  }>;
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
          placeholder="Search by tags (comma-separated)..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
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
        {results.notes && results.notes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Dreams</h3>
            {results.notes.map(note => (
              <div key={note.id} className="p-4 border-b">
                <h4 className="font-semibold">{note.title}</h4>
                <p className="text-sm text-gray-600">by @{note.user.username}</p>
                <p className="text-sm mt-1">{note.content.substring(0, 150)}...</p>
                <div className="text-xs text-gray-500 mt-2">
                  Tags: {note.tags.map(tag => tag.name).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}