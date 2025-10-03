// components/Footer.tsx
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import links from "../content/footer/links.json"; // ← JSON desde /content/footer

type FooterLink = { title: string; href: string; external?: boolean };
const isExternal = (href: string) => /^(https?:\/\/|tel:|mailto:)/i.test(href);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Image src="/brand/blinkx.webp" alt="BlinkX" width={120} height={30} className="h-8 w-auto" />
          <p className="text-sm">Industrial catalog for products, affiliates, and lead listings.</p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {(links as FooterLink[]).map((link, idx) => {
              if (isExternal(link.href) || link.external) {
                const newTab = /^https?:\/\//i.test(link.href);
                const externalAttrs = newTab
                  ? { target: '_blank' as const, rel: 'noopener noreferrer' }
                  : {};
                return (
                  <li key={`${link.title}-${idx}`}>
                    <a href={link.href} {...externalAttrs} className="hover:underline">
                      {link.title}
                    </a>
                  </li>
                );
              }
              return (
                <li key={`${link.title}-${idx}`}>
                  <Link href={link.href} className="hover:underline">
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-6 text-xs text-gray-500">© {year} BlinkX. All rights reserved.</div>
      </div>
    </footer>
  );
}
