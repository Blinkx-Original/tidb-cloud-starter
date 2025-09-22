import * as React from "react";
import NextLink from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 max-w-7xl mx-auto px-4">
      <div className="bg-black border border-gray-700 rounded-2xl p-8 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="text-base font-semibold">BlinkX</div>
            <p className="mt-2 text-white">
              Industrial catalog for products, affiliates, and lead listings.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase text-white">Catalog</div>
            <ul className="mt-3 space-y-2">
              <li>
                <NextLink href="/" className="hover:underline">
                  Home
                </NextLink>
              </li>
              <li>
                <NextLink href="/categories" className="hover:underline">
                  Categories
                </NextLink>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase text-white">Company</div>
            <ul className="mt-3 space-y-2">
              <li>
                <NextLink href="/about" className="hover:underline">
                  About
                </NextLink>
              </li>
              <li>
                <NextLink href="/contact" className="hover:underline">
                  Contact
                </NextLink>
              </li>
              <li>
                <NextLink href="/blog" className="hover:underline">
                  Blog
                </NextLink>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase text-white">Legal</div>
            <ul className="mt-3 space-y-2">
              <li>
                <NextLink href="/privacy" className="hover:underline">
                  Privacy Policy
                </NextLink>
              </li>
              <li>
                <NextLink href="/terms" className="hover:underline">
                  Terms of Service
                </NextLink>
              </li>
              <li>
                <NextLink href="/cookies" className="hover:underline">
                  Cookies
                </NextLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between text-xs text-white gap-3">
          <div>© {year} BlinkX. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">
              Twitter
            </a>
            <a href="#" className="hover:underline">
              LinkedIn
            </a>
            <a href="#" className="hover:underline">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

