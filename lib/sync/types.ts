export type SyncTarget = "algolia";

export type SyncCheckpoint = {
  target: SyncTarget;
  lastUpdatedAt: Date;
};

export type TiDBProductRow = {
  id: number;
  sku: string | null;
  slug: string | null;
  name: string | null;
  brand: string | null;
  short_description: string | null;
  long_description: string | null;
  price: number | string | null;
  currency: string | null;
  categories: string | null;
  attributes: string | null;
  images: string | null;
  is_published: number | null;
  stock_qty: number | null;
  stock_status: string | null;
  canonical_sku: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

export type ProductDTO = {
  objectID: string;
  sku: string;
  slug: string;
  url: string;
  name: string;
  brand?: string;
  shortDescription?: string;
  longDescription?: string;
  price?: number;
  currency?: string;
  categories?: string[];
  attributes?: Record<string, string | number | boolean>;
  images?: string[];
  isPublished: boolean;
  stockQty?: number;
  stockStatus?: "instock" | "outofstock" | "onbackorder";
  updatedAt: string;
};

export type SyncSummary = {
  target: SyncTarget;
  startedAt: string;
  finishedAt: string;
  ok: number;
  failed: number;
  notes?: Record<string, unknown>;
  checkpoint?: string | null;
};
