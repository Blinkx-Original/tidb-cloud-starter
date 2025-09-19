import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import CommonLayout from '../../components/v2/Layout'; // <-- envuelve con el layout (muestra Header)
import { pool } from '../../lib/db';

type Product = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price_eur: number | null;
  price: number | null;
  image_url: string | null;
  category_name: string | null;
};

type Listing = {
  id: number;
  title: string;
  url: string;
  price: number | null;
  source: string | null;
};

type Props = { product: Product | null; listings: Listing[] };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || '');
  const [rows] = await pool.query(
    `SELECT id, sku, name, slug, description, price_eur, price, image_url, category_name
     FROM products WHERE slug = ? LIMIT 1`,
    [slug]
  );
  const product = (rows as any[])[0] || null;

  let listings: any[] = [];
  if (product) {
    const [ls] = await pool.query(
      `SELECT id, title, url, price, source
       FROM listings
       WHERE product_id = ?
       ORDER BY price IS NULL, price ASC, id ASC
       LIMIT 20`,
      [product.id]
    );
    listings = ls as any[];
  }

  return { props: { product, listings } };
};

const fmt = (n?: number | null) => (typeof n === 'number' ? `€${n.toFixed(2)}` : '—');

const ProductPage: NextPage<Props> = ({ product, listings }) => {
  if (!product) {
    return (
      <CommonLayout>
        <Head><title>Not found</title></Head>
        <div className="max-w-4xl mx-auto p-6">
          <div className="border rounded-xl p-8 text-center">Product not found.</div>
        </div>
      </CommonLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} — BlinkX</title>
        <meta name="description" content={product.description || product.name} />
      </Head>

      {/* ⬇️ AHORA SIEMPRE HAY HEADER PORQUE USAMOS CommonLayout */}
      <CommonLayout>
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {/* Card principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-2xl p-5 shadow-sm">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              <h2 className="text-sm text-gray-500">{product.category_name || '—'} • SKU: {product.sku}</h2>
              <div className="mt-3 text-2xl font-bold">{fmt(product.price_eur ?? product.price)}</div>
              <p className="mt-4 text-gray-700">
                {product.description || 'This is dummy copy for an affiliate/e-commerce style detail page.'}
              </p>
              <div className="mt-6">
                <a
                  href={(listings[0]?.url) || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-black text-white hover:opacity-90"
                >
                  Go to Offer
                </a>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Listings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(listings && listings.length ? listings : [
                { id: 0, title: 'Sample Listing (Dummy)', url: '#', price: product.price_eur ?? product.price, source: 'Affiliate' },
              ]).map((ls) => (
                <a key={`${ls.id}-${ls.title}`}
                   href={ls.url || '#'}
                   target="_blank"
                   rel="noreferrer"
                   className="border rounded-xl p-4 hover:shadow-sm transition block">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{ls.title}</div>
                      <div className="text-xs text-gray-500">{ls.source || '—'}</div>
                    </div>
                    <div className="text-sm font-semibold">{fmt(ls.price)}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </CommonLayout>
    </>
  );
};

export default ProductPage;
