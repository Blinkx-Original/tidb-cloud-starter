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
    // telemetry only; no DB logic here
    safeTrack('search_submit', { query, from: 'header' });
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={onSubmit} className={`flex items-center gap-2 ${className}`}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="input input-sm w-44 sm:w-64 rounded-2xl border bg-white text-sm"
        aria-label="Search"
      />
      <button
        type="submit"
        className="btn btn-sm rounded-2xl bg-black text-white border-black hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
