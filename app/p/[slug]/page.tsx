import { MDXRemote } from 'next-mdx-remote/rsc';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import mdxComponents from '@/lib/mdx-components';
import { getProductBySlug } from '@/lib/db';
import { buildMeta } from '@/lib/seo';
import type { Product } from '@/lib/types';

export const runtime = 'nodejs';
export const revalidate = 86400;

const MAX_MDX_SIZE = 100_000;

function ensureRecord(value: unknown): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
}

function parseImages(product: Product, frontmatter: Record<string, any>): string[] {
  const fromFrontmatter = Array.isArray(frontmatter.images) ? frontmatter.images.filter(Boolean) : [];
  if (fromFrontmatter.length) return fromFrontmatter.map(String);
  if (!product.images_json) return [];
  try {
    const parsed = JSON.parse(product.images_json);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean).map(String);
    }
  } catch (error) {
    console.warn('Failed to parse images_json', error);
  }
  return [];
}

function sanitizeHtmlBody(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'video', 'source']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      a: ['href', 'title', 'target', 'rel'],
      video: ['controls', 'src', 'poster'],
      source: ['src', 'type'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

function guardMdx(body: string | null | undefined): string | null {
  if (!body) return null;
  if (body.length > MAX_MDX_SIZE) {
    console.warn(`MDX body exceeded ${MAX_MDX_SIZE} bytes, falling back to HTML.`);
    return null;
  }
  if (/^\s*(import|export)\s+/m.test(body)) {
    console.warn('MDX body contained disallowed import/export statement.');
    return null;
  }
  return body;
}

type CTAKey = 'lead' | 'stripe' | 'affiliate' | 'paypal';

function resolveCtas(product: Product, frontmatter: Record<string, any>) {
  const overrides = ensureRecord(frontmatter.cta_overrides);
  const base: Record<CTAKey, string | null | undefined> = {
    lead: overrides.lead ?? product.cta_lead_url ?? null,
    stripe: overrides.stripe ?? product.cta_stripe_url ?? null,
    affiliate: overrides.affiliate ?? product.cta_affiliate_url ?? null,
    paypal: overrides.paypal ?? product.cta_paypal_url ?? null,
  };
  const primary = (['lead', 'stripe', 'affiliate', 'paypal'] as CTAKey[]).find((key) => {
    const value = base[key];
    return typeof value === 'string' && value.trim().length > 0;
  });
  return {
    ...base,
    primary,
  };
}

function computeMetadata(product: Product) {
  const meta = buildMeta(product);
  const frontmatter = ensureRecord(product.mdx_frontmatter_json);
  const images = parseImages(product, frontmatter);
  const openGraphImages = images.length ? images.map((url) => ({ url })) : undefined;
  return {
    meta,
    images,
    frontmatter,
    openGraphImages,
  };
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product || product.is_published !== 1) {
    return {};
  }
  const { meta, openGraphImages } = computeMetadata(product);
  return {
    title: meta.title,
    description: meta.desc,
    alternates: { canonical: meta.canonical },
    openGraph: {
      title: meta.title,
      description: meta.desc,
      url: meta.canonical,
      type: 'website',
      images: openGraphImages,
    },
    twitter: {
      card: openGraphImages?.length ? 'summary_large_image' : 'summary',
      title: meta.title,
      description: meta.desc,
      images: openGraphImages?.[0]?.url ? [openGraphImages[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.is_published !== 1) {
    notFound();
  }

  const { meta, images, frontmatter } = computeMetadata(product);
  const mdxBody = guardMdx(product.mdx_body ?? null);
  const fallbackHtml = sanitizeHtmlBody(product.desc_html);
  const ctas = resolveCtas(product, frontmatter);
  const primaryHref = ctas.primary ? (ctas as Record<CTAKey, string | null | undefined>)[ctas.primary] : null;

  return (
    <div className="bg-slate-950/3 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6">
        <header className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-start">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-blue-500">Producto</p>
            <h1 className="text-4xl font-semibold text-slate-900">{meta.title}</h1>
            {(frontmatter.subtitle || product.short_summary) && (
              <p className="text-base text-slate-600">{frontmatter.subtitle || product.short_summary}</p>
            )}
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {product.brand && (
                <div>
                  <dt className="font-medium text-slate-700">Marca</dt>
                  <dd>{product.brand}</dd>
                </div>
              )}
              {product.model && (
                <div>
                  <dt className="font-medium text-slate-700">Modelo</dt>
                  <dd>{product.model}</dd>
                </div>
              )}
              {product.sku && (
                <div>
                  <dt className="font-medium text-slate-700">SKU</dt>
                  <dd>{product.sku}</dd>
                </div>
              )}
            </dl>
            {primaryHref ? (
              <a href={primaryHref || '#'} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                Hablar con ventas
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex w-fit cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-8 py-3 text-sm font-semibold text-slate-500"
              >
                Contacto no disponible
              </button>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {images.length ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[0]}
                alt={meta.title}
                className="h-80 w-full rounded-3xl object-cover shadow-xl"
              />
            ) : (
              <div className="flex h-80 w-full items-center justify-center rounded-3xl border border-dashed border-slate-300 text-slate-400">
                Imagen pendiente
              </div>
            )}
            {images.slice(1, 4).length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.slice(1, 4).map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={image} src={image} alt={meta.title} className="h-24 w-full rounded-2xl object-cover" />
                ))}
              </div>
            )}
          </div>
        </header>

        <section className="prose prose-blue mx-auto w-full max-w-none prose-headings:font-semibold prose-p:text-slate-700">
          {mdxBody ? (
            // @ts-expect-error Async server component from next-mdx-remote
            <MDXRemote source={mdxBody} components={mdxComponents} />
          ) : fallbackHtml ? (
            <div dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
          ) : (
            <p className="text-sm text-slate-500">No hay contenido disponible para este producto todavía.</p>
          )}
        </section>
      </div>
    </div>
  );
}
