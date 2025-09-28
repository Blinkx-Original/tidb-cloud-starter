// pages/product/[slug].tsx
import Head from 'next/head';
import Link from 'next/link';
import CommonLayout from '@/components/v2';
import Breadcrumbs from '@/components/v2/breadcrumbs';
import StickyFooterCTA from '@/components/v2/StickyFooterCTA';
import SearchHero from '@/components/v2/SearchHero';
import { GetServerSideProps } from 'next';
import { query, Product } from '@/lib/db';
import { formatPriceEUR } from '@/lib/price';

type Props = { product: Product | null };

export default function ProductPage({ product }: Props) {
  if (!product) {
    return (
      <CommonLayout>
        <main className="mx-auto max-w-6xl px-4 bg-white text-black min-h-screen">
          <div className="py-16 text-center">
            <h1 className="text-2xl font-bold">Producto no encontrado</h1>
            <p className="mt-2">
              <Link href="/" className="underline">Volver al inicio</Link>
            </p>
          </div>
        </main>
      </CommonLayout>
    );
  }

  const price = formatPriceEUR(product.price_eur ?? product.price);

  // CTA configurable (lee campos opcionales si existen; si no, usa la categoría)
  const anyProduct = product as any;
  const fallbackLabel = product.category_name ? `Ver más en ${product.category_name}` : 'Ver categorías';
  const fallbackHref = product.category_slug ? `/category/${product.category_slug}` : '/categories';
  const ctaLabel: string = anyProduct.cta_label ?? fallbackLabel;
  const ctaHref: string = anyProduct.cta_url ?? fallbackHref;

  return (
    <CommonLayout>
      <Head>
        <title>{product.name} — BlinkX</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4 bg-white text-black min-h-screen">
        {/* Migas + buscador */}
        <div className="pt-6">
          <Breadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Categorías', href: '/categories' },
              product.category_slug
                ? { label: product.category_name ?? 'Categoría', href: `/category/${product.category_slug}` }
                : { label: product.category_name ?? 'Sin categoría' },
              { label: product.name },
            ]}
          />
        </div>

        <SearchHero
          title="¿Buscas otra alternativa?"
          subtitle="Empieza a escribir y te sugerimos productos al instante"
          className="mt-4 rounded-2xl overflow-hidden"
          autoFocus={false}
        />

        {/* Sección principal: izquierda imagen, derecha texto */}
        <section className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IZQUIERDA: Imagen (placeholder 4:3). 
               TODO: si tienes cf_image_id, construye la URL de Cloudflare Images:
               /cdn-cgi/imagedelivery/<ACCOUNT_HASH>/<IMAGE_ID>/product-hero
            */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white aspect-[4/3]">
              {product.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            {/* DERECHA: Título, precio, desc, CTA único */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-black">{product.name}</h1>

              {price && <div className="mt-3 text-xl font-semibold text-black">{price}</div>}

              <div className="mt-2 text-sm text-gray-600">
                {product.category_name ?? 'Sin categoría'}
              </div>

              {/* Breve descripción / excerpt */}
              {product.description && (
                <p className="mt-4 text-gray-700">
                  {product.description}
                </p>
              )}

              {/* ÚNICO BOTÓN (azul “eléctrico” accent) */}
              <Link
                href={ctaHref}
                className="inline-block mt-6 px-4 py-2 rounded-2xl bg-accent text-white shadow-accent-glow hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-ring"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </section>

        {/* ABAJO: Caja grande para contenido largo (MDX pronto) */}
        <section className="mt-6">
          <div className="border border-gray-200 rounded-2xl p-6">
            {/* Placeholder: hoy muestra la descripción.
               Próximamente: renderizar MDX desde TiDB o /content/products/<slug>.mdx */}
            <article className="prose prose-neutral max-w-none">
              {product.description ? (
                <div>{product.description}</div>
              ) : (
                <p className="text-gray-600">Contenido técnico y especificaciones ampliadas próximamente.</p>
              )}
            </article>
          </div>
        </section>

        {/* Espaciador para que el sticky no tape nada */}
        <div className="h-24 sm:h-20" />
      </main>

      <StickyFooterCTA
        title={product.name}
        buttonLabel={ctaLabel}
        buttonHref={ctaHref}
      />
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const slug = String(params?.slug ?? '');

  const rows = await query<Product>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description,
      category_name, category_slug
    FROM products
    WHERE slug = ?
    LIMIT 1
  `,
    [slug]
  );

  const product = rows[0] ?? null;
  return { props: { product } };
};
