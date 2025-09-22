/* eslint-disable react/no-unknown-property */
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SearchPill() {
  const router = useRouter();
  const params = useSearchParams();
  const qParam = params?.get('q') ?? ''; // <- evita el error "Object is possibly 'null'"
  const [q, setQ] = useState(qParam);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setQ(qParam), [qParam]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search`);
  };

  return (
    <form onSubmit={submit} className="pill" role="search" aria-label="Site search">
      <input
        ref={inputRef}
        className="input"
        type="search"
        placeholder="Search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoComplete="off"
      />
      <button className="go" type="submit" aria-label="Search">↵</button>
      <style jsx>{`
        .pill {
          display: flex; align-items: center;
          gap: 8px; padding: 8px 12px;
          border: 1px solid #e5e7eb; border-radius: 999px; background: #fff;
          width: min(560px, 80vw);
        }
        .input { flex: 1; border: 0; outline: 0; font-size: 14px; background: transparent; }
        .go { border: 0; background: #111; color: #fff; border-radius: 999px; padding: 4px 10px; cursor: pointer; }
        @media (max-width: 640px) {
          .pill { width: 100%; padding: 8px 10px; }
          .input { font-size: 16px; }
        }
      `}</style>
    </form>
  );
}

