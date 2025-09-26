'use client';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Minimal BlinkX header:
 * - Left: logo linking home
 * - Right: hamburger link to categories
 * - No search bar or theme toggle
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/brand/blinkx.webp"
              alt="BlinkX"
              width={120}
              height={30}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="flex items-center">
          {/* Hamburger icon linking to categories */}
          <Link href="/categories" aria-label="Menú" className="text-2xl leading-none">
            ☰
          </Link>
        </div>
      </div>
    </header>
  );
}
