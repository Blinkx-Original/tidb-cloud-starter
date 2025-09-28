// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import CommonLayout from "@/components/v2";
import SearchHero from "@/components/v2/SearchHero";
import PillBlock from "@/components/v2/PillBlock";
import { GetServerSideProps } from "next";
import { query, Product } from "@/lib/db";
import { formatPriceEUR } from "@/lib/price";

type CategoryRow = { slug: string; name: string; count: number };
type Props = { categories: CategoryRow[]; products: Product[] };

export default function Home({ categories, products }: Props) {
  return (
    <CommonLayout>
      <Head>
        <title>BlinkX — Catálogo</title>
        <meta
          name="description"
          content="Encuentra tu próximo producto. Búsqueda simple y rápida en todo el catálogo."
        />
      </Head>

      {/* Hero de homepage */}
      <section className="bg-[#f6f6f6]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1]">
            Encuentra tu próximo producto
          </h1>
          <h2 className="mt-2 text-lg sm:text-xl font-bold opacity-90 tracking-tight">
            Búsqueda simple y rápida en todo el catálogo.
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-base opacity-80 leading-relaxed">
            Este es un texto de ejemplo en la página principal. Aquí puedes
            escribir lo que quieras sobre tu catálogo, tu empresa o cualquier
            mensaje de bienvenida para los usuarios. Si más adelante quieres
            cambiarlo, simplemente edita este archivo <code>pages/index.tsx</code>.
          </p>
        </div>
      </section>

      {/* Pastilla de búsqueda */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <SearchHero variant="compact" />
      </div>


      {/* CTA estilo Vercel — centrado, más espaciado, card con borde fino y elevación */}
      <section className="mx-auto max-w-6xl px-4 mt-12 sm:mt-16 mb-12 sm:mb-16">
        <div className="rounded-2xl border border-black/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="px-6 sm:px-10 py-8 sm:py-10 text-center">
            <h3 className="mx-auto max-w-4xl text-[1.25rem] sm:text-2xl md:text-[28px] font-semibold leading-snug tracking-tight text-gray-900">
              <span className="font-semibold">Deploy once, deliver everywhere.</span>{" "}
              <span className="text-gray-600">
                When you push code to Vercel, we make it instantly available across the globe.
              </span>
            </h3>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <a
                href="https://vercel.com/infrastructure"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-black text-white px-5 sm:px-6 py-3 text-sm font-medium border border-black hover:opacity-90 transition"
              >
                More about Infrastructure
              </a>
              <a
                href="https://vercel.com/enterprise"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-white text-gray-900 px-5 sm:px-6 py-3 text-sm font-medium border border-black/10 hover:border-black/20 transition"
              >
                Learn about Enterprise
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* FIN CTA */}



      
      {/* Bloque de pills existente */}
      <PillBlock
        segments={[
          {
            textBefore: "Scale your",
            pill: { label: "Enterprise", href: "/enterprise", icon: "🏢" },
            textAfter: "without compromising",
          },
          {
            pill: { label: "Security", href: "/security", icon: "🛡️" },
            textAfter: "and explore",
          },
          {
            pill: { label: "Docs", href: "/docs", icon: "📚" },
            textAfter: "for developers.",
          },
        ]}
      />

      {/* CTA estilo Vercel — centrado, más espaciado, card con borde fino y elevación */}
      <section className="mx-auto max-w-6xl px-4 mt-12 sm:mt-16 mb-12 sm:mb-16">
        <div className="rounded-2xl border border-black/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="px-6 sm:px-10 py-8 sm:py-10 text-center">
            <h3 className="mx-auto max-w-4xl text-[1.25rem] sm:text-2xl md:text-[28px] font-semibold leading-snug tracking-tight text-gray-900">
              <span className="font-semibold">Deploy once, deliver everywhere.</span>{" "}
              <span className="text-gray-600">
                When you push code to Vercel, we make it instantly available across the globe.
              </span>
            </h3>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <a
                href="https://vercel.com/infrastructure"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-black text-white px-5 sm:px-6 py-3 text-sm font-medium border border-black hover:opacity-90 transition"
              >
                More about Infrastructure
              </a>
              <a
                href="https://vercel.com/enterprise"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-white text-gray-900 px-5 sm:px-6 py-3 text-sm font-medium border border-black/10 hover:border-black/20 transition"
              >
                Learn about Enterprise
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* FIN CTA */}

      {/* Categorías populares */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl sm:text-2xl font-semibold">
            Categorías populares
          </h3>
          <Link
            href="/categories"
            className="text-sm underline hover:no-underline"
          >
            Ver todas
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="mt-4 opacity-80">Aún no hay categorías.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-xl border border-black/10 hover:border-black/20 bg-white px-4 py-3"
              >
                <div className="font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Novedades */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h3 className="text-xl sm:text-2xl font-semibold">Novedades</h3>
        {products.length === 0 ? (
          <p className="mt-4 opacity-80">Aún no hay productos.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const price = formatPriceEUR(p.price_eur ?? p.price);
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug || p.id}`}
                  className="group rounded-xl border border-black/10 hover:border-black/20 bg-white overflow-hidden"
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-44 w-full object-cover bg-[#f6f6f6]"
                      loading="lazy"
                    />
                  ) : null}

                  <div className="p-4">
                    <div className="font-semibold group-hover:underline">
                      {p.name}
                    </div>
                    {p.description && (
                      <p className="mt-1 text-sm line-clamp-2 opacity-80">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-2 text-xs opacity-70">
                      {p.category_name ?? "Sin categoría"}
                    </div>
                    {price && <div className="mt-2 font-medium">{price}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </CommonLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const categories = await query<CategoryRow[]>(
    `
    SELECT
      COALESCE(category_slug, 'uncategorized') AS slug,
      COALESCE(category_name, 'Uncategorized') AS name,
      COUNT(*) AS count
    FROM products
    GROUP BY slug, name
    ORDER BY count DESC, name ASC
    LIMIT 12
  `
  );

  const products = await query<Product[]>(
    `
    SELECT id, name, slug, image_url, price_eur, price, description, category_name, category_slug
    FROM products
    ORDER BY id DESC
    LIMIT 12
  `
  );

  return { props: { categories, products } };
};
