// pages/index.tsx  ← REEMPLAZAR (archivo completo)
import * as React from 'react';
import Head from 'next/head';
import CommonLayout from 'components/v2/Layout';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import CategoryGrid from 'components/v2/CategoryGrid';
import fs from 'fs';
import path from 'path';

const ProductList = dynamic(() => import('components/v2/Cards/ShoppingItemCardList'), { ssr: false });

type Site = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroText: string | null;
};

type Props = {
  site: Site;
};

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'content', 'site', 'index.json');
  let site: Site = {
    heroTitle: null,
    heroSubtitle: null,
    heroText: null,
  };

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw || '{}');
    site = {
      heroTitle: json.heroTitle ?? null,
      heroSubtitle: json.heroSubtitle ?? null,
      heroText: json.heroText ?? null,
    };
  } catch {
    // Si aún no existe el archivo (primer deploy), renderizamos con defaults.
  }

  return { props: { site } };
}

export default function HomePage({ site }: Props) {
  const [page, setPage] = React.useState(1);
  const pageSize = 6; // featured

  const title = site.heroTitle || 'BlinkX Catalog';
  const subtitle = site.heroSubtitle || 'Products, affiliates, and lead listings';
  const text =
    site.heroText ||
    'Every deploy is remarkable. Chat with your team on real, production-grade UI, not just designs.';

  return (
    <>
      <Head>
        <title>BlinkX – Industrial Catalog</title>
        <meta name="description" content="BlinkX Catalog Homepage" />
      </Head>

      <CommonLayout>
        {/* HERO TEXT (centered) - editable desde Keystatic (content/site/index.json) */}
        <div className="max-w-3xl mx-auto text-center px-4 py-12">
          <h1 className="text-4xl font-bold text-black font-sans mb-4">{title}</h1>
          <h2 className="text-xl text-gray-600 font-sans mb-6">{subtitle}</h2>
          <p className="text-gray-500 font-sans leading-relaxed">{text}</p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <NextLink
              href="/categories"
              className="btn bg-black text-white border-black hove

