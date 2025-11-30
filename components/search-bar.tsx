'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json() as { results: any[] };
            setResults(data.results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSearch} className="flex">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="grep 'search_term'"
                    className="bg-black border border-green-900 text-green-500 text-sm px-2 py-1 focus:outline-none focus:border-green-500 w-48 font-mono"
                />
                <button type="submit" className="bg-green-900 text-green-100 px-2 text-sm border border-l-0 border-green-900 hover:bg-green-800">
                    GO
                </button>
            </form>

            {/* Search Results Dropdown */}
            {(results.length > 0 || loading) && query && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-black border border-green-900 shadow-xl z-50">
                    {loading ? (
                        <div className="p-2 text-xs text-green-700">Scanning...</div>
                    ) : (
                        results.map(item => (
                            <Link key={item.thread.id} href={`/thread/${item.thread.slug}`} className="block p-2 hover:bg-green-900/20 border-b border-green-900/30">
                                <div className="text-sm font-bold text-green-400 truncate">{item.thread.title}</div>
                                <div className="text-xs text-green-700">in {item.category}</div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
