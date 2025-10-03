import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProductBySlug } from '@/lib/sync/tidb';
import { transformRow } from '@/lib/sync/transform';
import { sanitizeRichText } from '@/lib/sync/html';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

async function loadProduct(slug: string) {
  const row = await fetchProductBySlug(slug);
  if (!row) return null;
  const { product } = transformRow(row);
  return product.isPublished ? product : null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await loadProduct(params.slug);
  if (!product) {
    return { title: 'Producto no encontrado' };
  }
  const description = product.shortDescription || product.longDescription || '';
  return {
    title: `${product.name} | Catálogo`,
    description: description ? description.slice(0, 160) : undefined,
    alternates: { canonical: product.url },
    openGraph: {
      title: product.name,
      description: description ? description.slice(0, 160) : undefined,
      url: product.url,
      type: 'website',
      images: product.images?.map((src) => ({ url: src })) || undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await loadProduct(params.slug);
  if (!product) {
    notFound();
  }

  const sanitizedLong = sanitizeRichText(product.longDescription);
  const availabilityMap: Record<string, string> = {
    instock: 'https://schema.org/InStock',
    outofstock: 'https://schema.org/OutOfStock',
    onbackorder: 'https://schema.org/BackOrder',
  };
  const availability = product.stockStatus
    ? availabilityMap[product.stockStatus.toLowerCase()] || availabilityMap.outofstock
    : availabilityMap.outofstock;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    url: product.url,
    image: product.images,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers:
      typeof product.price === 'number'
        ? {
            '@type': 'Offer',
            priceCurrency: product.currency || 'USD',
            price: product.price,
            availability,
          }
        : undefined,
  };

  return (
    <div className="bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl space-y-10 px-6">
        <article className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            {product.images && product.images.length ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full rounded-2xl object-cover shadow"
              />
            ) : (
              <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 text-gray-400">
                Sin imagen disponible
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.slice(1, 5).map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={image}
                    src={image}
                    alt={product.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-blue-600">Producto</p>
              <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
              {product.brand && <p className="text-sm text-gray-500">Marca: {product.brand}</p>}
            </div>
            <div className="space-y-2">
              {typeof product.price === 'number' ? (
                <p className="text-2xl font-semibold text-gray-900">
                  {product.currency || 'USD'} {product.price.toFixed(2)}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Precio no disponible</p>
              )}
              <p className="text-sm text-gray-500">
                Disponibilidad: <span className="font-medium text-gray-900">{product.stockStatus || '—'}</span>
              </p>
              {product.stockQty != null && (
                <p className="text-sm text-gray-500">Stock: {product.stockQty}</p>
              )}
            </div>
            {product.categories && (
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-gray-700">Categorías</h2>
                <p className="text-sm text-gray-500">{product.categories.join(', ')}</p>
              </div>
            )}
            {product.attributes && (
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-gray-700">Atributos</h2>
                <ul className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <li key={key} className="flex justify-between gap-3">
                      <span className="font-medium text-gray-700">{key}</span>
                      <span>{String(value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>

        {sanitizedLong && (
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizedLong }}
            />
          </section>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </div>
    </div>
  );
}
