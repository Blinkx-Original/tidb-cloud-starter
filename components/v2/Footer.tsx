// components/v2/Footer.tsx
import * as React from "react";
import NextLink from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 max-w-7xl mx-auto px-4">
      {/* Caja blanca con borde fino y esquinas redondeadas */}
      <div className="rounded-2xl p-8 bg-white text-black border border-black/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="text-base font-semibold">BlinkX</div>
            <p className="mt-2">
              Industrial catalog for products, affiliates, and lead listings.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase">Catalog</div>
            <ul className="mt-3 space-y-2">
              <li><NextLink href="/" className="hover:underline">Home</NextLink></li>
              <li><NextLink href="/categories" className="hover:underline">Categories</NextLink></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase">Company</div>
            <ul className="mt-3 space-y-2">
              <li><NextLink href="/about" className="hover:underline">About</NextLink></li>
              <li><NextLink href="/contact" className="hover:underline">Contact</NextLink></li>
              <li><NextLink href="/blog" className="hover:underline">Blog</NextLink></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase">Legal</div>
            <ul className="mt-3 space-y-2">
              <li><NextLink href="/privacy" className="hover:underline">Privacy Policy</NextLink></li>
              <li><NextLink href="/terms" className="hover:underline">Terms of Service</NextLink></li>
              <li><NextLink href="/cookies" className="hover:underline">Cookies</NextLink></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <div>© {year} BlinkX. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Twitter</a>
            <a href="#" className="hover:underline">LinkedIn</a>
            <a href="#" className="hover:underline">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


