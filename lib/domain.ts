// lib/domain.ts
export type Product = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  price_eur: number | null; // or price
  description: string | null;
  category_name: string | null;
  category_slug: string | null;
};

export type Category = {
  name: string;
  slug: string;
  count?: number;
};
