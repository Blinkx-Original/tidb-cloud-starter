import * as React from 'react';

type Item = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  image_url?: string | null;
  price_eur?: number | null;
  price?: number | null;
  category_name?: string | null;
  description?: string | null;
};

const fmt = (n?: number | null) => (typeof n === 'number' ? `€${n.toFixed(2)}` : '—');

export default function ShoppingItemCardList({ page, pageSize }: { page: number; pageSize: number }) {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let on = true;
    setLoading(true);
    fetch(`/api/products?page=${page}&pageSize=${pageSize}`)
      .then((r) => r.json())
      .then((d) => { if (on) setItems(d.items || []); })
      .finally(() => on && setLoading(false));
    return () => { on = false; };
  }, [page, pageSize]);

  if (loading) return <div>Loading…</div>;
  if (!items.length) return <div className="text-center text-gray-500 py-8">No products found.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((it) => (
        <a key={it.id} href={`/product/${it.slug}`} className="block border rounded-xl p-4 hover:shadow-md transition">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
            {it.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
            )}
          </div>
          <h3 className="mt-3 font-semibold">{it.name}</h3>
          <div className="text-sm text-gray-500">{it.category_name || '—'}</div>
          <div className="mt-1 font-medium">{fmt(it.price_eur ?? it.price)}</div>
        </a>
      ))}
    </div>
  );
}
