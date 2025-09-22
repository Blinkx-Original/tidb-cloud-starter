// components/v2/Layout/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/v2/SearchBar';

export default function Header() {
  return (
    <header className="navbar bg-base-100 border-b">
      {/* Left: Logo */}
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost gap-2">
          <Image
            src="/logo.png"
            alt="BlinkX"
            width={20}
            height={20}
            className="rounded"
          />
          <span className="font-semibold text-lg">BlinkX</span>
        </Link>
      </div>

      {/* Center: Search (always visible, mobile-friendly pill) */}
      <div className="navbar-center flex-1 px-2">
        <div className="w-full flex justify-center">
          <SearchBar
            placeholder="Search products…"
            className="w-full max-w-xs sm:max-w-md"
          />
        </div>
      </div>

      {/* Right: Hamburger menu */}
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-56"
          >
            <li><Link href="/">Home</Link></li>
            <li><Link href="/categories">Categories</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/search">Search page</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
