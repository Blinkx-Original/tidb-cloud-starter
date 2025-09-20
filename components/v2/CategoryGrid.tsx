import * as React from 'react';
import NextLink from 'next/link';

type Category = { slug: string; name: string; count: number };

export default function CategoryGrid() {
  const [items, setItems] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let on = true;
    fetch('/api/categories?limit=24')
      .then(r => r.json())
      .then(d => { if (on) setItems(d.items || []); })
      .finally(() => on && setLoading(false));
    return () => { on = false; };
  }, []);

  if (loading) return <div>Loading…</div>;
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(cat => (
        <NextLink key={cat.slug} href={`/category/${encodeURIComponent(cat.slug)}`}
          className="block bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="text-lg font-semibold">{cat.name}</div>
          <div className="text-sm text-gray-500">{cat.count} products</div>
        </NextLink>
      ))}
    </div>
  );
}
