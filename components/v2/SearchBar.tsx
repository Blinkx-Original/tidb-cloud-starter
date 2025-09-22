// components/v2/SearchBar.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import { safeTrack } from '@/lib/analytics';

export default function SearchBar({
  placeholder = 'Search products…',
  className = '',
  defaultQuery = '',
}: {
  placeholder?: string;
  className?: string;
  defaultQuery?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    safeTrack('search_submit', { query, from: 'header' });
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={onSubmit} className={`flex items-center gap-2 ${className}`}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="input input-sm w-full rounded-full border bg-white text-sm"
      />
      <button
        type="submit"
        className="btn btn-sm rounded-2xl bg-black text-white border-black hover:opacity-90 hidden sm:inline-flex"
        aria-label="Submit search"
      >
        Search
      </button>
    </form>
  );
}
