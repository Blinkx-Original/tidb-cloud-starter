// components/v2/Layout/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import SearchPill from '../SearchPill';

export type HeaderProps = {}; // ← exporta el tipo para evitar futuros errores

export default function Header(_props: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Ir a inicio">
          <Image src="/logo.png" alt="BlinkX" width={24} height={24} className="rounded" />
          <span className="font-semibold">BlinkX</span>
        </Link>

        {/* Pastilla de búsqueda: visible en md+, en móvil dejamos botón */}
        <div className="flex-1 hidden md:flex justify-center">
          <SearchPill size="sm" placeholder="Buscar productos..." />
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/categories"
            className="px-3 py-1 rounded-full bg-black text-white text-sm hover:opacity-90"
          >
            Categorías
          </Link>
          <button
            onClick={() => router.push('/search')}
            className="md:hidden px-3 py-1 rounded-full border border-neutral-200 text-sm"
            aria-label="Abrir búsqueda"
          >
            Buscar
          </button>
        </nav>
      </div>
    </header>
  );
}
