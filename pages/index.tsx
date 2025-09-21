// pages/index.tsx  ← REEMPLAZAR (archivo completo)
import * as React from "react";
import Head from "next/head";
import CommonLayout from "components/v2/Layout";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import CategoryGrid from "components/v2/CategoryGrid";
import fs from "fs";
import path from "path";

const ProductList = dynamic(
  () => import("components/v2/Cards/ShoppingItemCardList"),
  { ssr: false }
);

type Site = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroText: string | null;
};

type Props = {
  site: Site;
};

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "content", "site", "index.json");
  let site: Site = {
    heroTitle: null,
    heroSubtitle: null,
    heroText: null,
  };

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw || "{}");
    site = {
      heroTitle: json.heroTitle ?? null,
      heroSubtitle: json.heroSubtitle ?? null,
      heroText: json.heroText ?? null,
    };
  } catch {
    // If the file doesn't exist yet, render with defaults.
  }

  return { props: { site } };
}

export default function HomePage({ site }: Props) {
  const [page, setPage] = React.useState(1);
  const pageSize = 6; // featured

  const title = site.heroTitle || "BlinkX Catalog";
  const subtitle = site.heroSubtitle || "Products, affiliates, and lead listings";
  const text =
    site.heroText ||
    "Edit this copy in Keystatic -> Singleton: Site settings.";

  return (
    <>
      <Head>
        <title>BlinkX – Industrial Catalog</title>
        <meta name="description" content="BlinkX Catalog Homepage" />
      </Head>

      <CommonLayout>
        {/* HERO TEXT (centered) - editable via Keystatic (content/site/index.json) */}
        <div className="max-w-3xl mx-auto text-center px-4 py-12">
          <h1 className="text-4xl font-bold text-black font-sans mb-4">{title}</h1>
          <h2 className="text-xl text-gray-600 font-sans mb-6">{subtitle}</h2>
          <p className="text-gray-500 font-sans leading-relaxed">{text}</p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <NextLink
              href="/categories"
              className="btn bg-black text-white border-black hover:opacity-90 rounded-2xl"
            >
              Browse categories
            </NextLink>
            <NextLink href="/blog" className="btn btn-outline rounded-2xl">
              Blog
            </NextLink>
          </div>
        </div>

        {/* CATEGORIES GRID */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <div className="bg-white shadow-sm border rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Categories</h3>
              <p className="text-sm text-gray-500">Explore the catalog by category.</p>
            </div>
            <CategoryGrid />
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Featured products</h3>
            <NextLink href="/categories" className="text-sm text-gray-500 hover:underline">
              Browse all
            </NextLink>
          </div>
          <ProductList page={page} pageSize={pageSize} />

          <div className="flex items-center justify-center gap-3 pt-10">
            <button
              className="btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button className="btn" onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </CommonLayout>
    </>
  );
}
