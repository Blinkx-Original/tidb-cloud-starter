import type { Product } from './types';

export function normalizeQuotes(input: string): string {
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveFrontmatter(product: Product): Record<string, any> {
  if (!product.mdx_frontmatter_json || typeof product.mdx_frontmatter_json !== 'object') {
    return {};
  }
  return product.mdx_frontmatter_json as Record<string, any>;
}

export function buildMeta(product: Product) {
  const frontmatter = resolveFrontmatter(product);
  const title =
    frontmatter.title?.toString().trim() ||
    product.title_h1?.trim() ||
    product.slug;

  let description =
    frontmatter.meta_description?.toString().trim() ||
    product.meta_description?.trim() ||
    product.short_summary?.trim() ||
    '';

  description = normalizeQuotes(description).slice(0, 160);
  if (!description) {
    description = ' ';
  }

  const siteBase = (process.env.SITE_BASE || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const canonical = siteBase ? `${siteBase}/p/${product.slug}` : `/p/${product.slug}`;

  return {
    title,
    desc: description,
    canonical,
  };
}
