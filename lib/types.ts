export type Product = {
  id: number;
  slug: string;
  name: string;
  title_h1?: string | null;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  price?: number | null;
  price_eur?: number | null;
  image_url?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  description?: string | null;
  images_json?: string | null;
  desc_html?: string | null;
  short_summary?: string | null;
  meta_description?: string | null;
  mdx_body?: string | null;
  mdx_frontmatter_json?: unknown;
  mdx_updated_at?: string | null;
  cta_lead_url?: string | null;
  cta_stripe_url?: string | null;
  cta_affiliate_url?: string | null;
  cta_paypal_url?: string | null;
  is_published: 0 | 1;
  last_tidb_update_at?: string | null;
};

export type SitemapProduct = {
  slug: string;
  lastmod: string;
};
