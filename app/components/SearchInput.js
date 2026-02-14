'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchInput() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            <input
                type="text"
                placeholder="キーワードで記事を検索（本文含む）..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '99px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--background) / 0.8)',
                    backgroundColor: 'rgba(204, 204, 204, 0.5)',
                    backdropFilter: 'blur(4px)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'hsl(var(--primary))'}
                onBlur={(e) => e.target.style.borderColor = 'hsl(var(--border))'}
            />
            <button
                type="submit"
                className="btn btn-primary"
                style={{
                    borderRadius: '99px',
                    padding: '0 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                検索
            </button>
        </form>
    );
}
