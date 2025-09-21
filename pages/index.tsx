// pages/index.tsx
import Head from 'next/head';
import CommonLayout from '@/components/v2';
import SearchPill from '@/components/v2/SearchPill';
import Link from 'next/link';

export default function Home() {
  return (
    <CommonLayout>
      <Head>
        <title>BlinkX — Catálogo</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4">
        {/* HERO */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold">Encuentra tu próximo producto</h1>
            <p className="mt-3 text-neutral-600">
              Búsqueda simple y rápida en todo el catálogo.
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <SearchPill size="lg" placeholder="Buscar por nombre, categoría o descripción…" autoFocus />
          </div>

          {/* Links de ayuda */}
          <div className="mt-4 text-center text-sm text-neutral-500">
            Sugerencias: <Link href="/categories" className="underline">ver categorías</Link>
          </div>
        </section>

        {/* Aquí puedes listar productos destacados o últimas categorías (opcional) */}
      </main>
    </CommonLayout>
  );
}
