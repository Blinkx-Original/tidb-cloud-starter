import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { homePageBookSumState } from 'atoms';

type Item = {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  price_eur?: number | null;
  price?: number | null;
  category_name?: string | null;
};

export default function ShoppingItemCardList({ page, pageSize }: { page: number; pageSize: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const [, setSum] = useRecoilState(homePageBookSumState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/products?page=${page}&pageSize=${pageSize}`)
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        setItems(data.items || []);
        setSum(data.total || 0);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
        setSum(0);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [page, pageSize, setSum]);

  if (loading) return <div>Loading…</div>;

  if (!items.length) {
    return <div className="text-center text-gray-500 py-8">No p
