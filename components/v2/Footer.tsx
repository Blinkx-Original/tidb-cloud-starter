// components/v2/Footer.tsx
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { footerLinks } from "../footerLinks"; // ← ruta desde /components/v2

type FooterLink = {
  title: string;
  href: string;
  external?: boolean;
};

function isExternal(href: string, external?: boolean) {
  if (external) return true;
  return /^https?:\/\//i.test(href);
}

function isTelOrMail(href: string) {
  return /^(tel:|mailto:)/i.test(href);
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 max-w-7xl mx-auto px-4">
      <div className="rounded-2xl p-8 bg-white text-black border border-black/10">
        {/* Marca + descripción (opcional) */}
        <div className="flex items-center gap-4">
          <Image
            src="/brand/blinkx.webp"
            alt="BlinkX"
            width={120}
            height={30}
            className="h-8 w-auto"
          />
          <p className="text-sm">
            Industrial catalog for products, affiliates, and lead listings.
          </p>
        </div>

        {/* Lista PLANA de enlaces del footer (sin títulos) */}
        <nav aria-label="Footer" className="mt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {footerLinks.map((link: FooterLink, idx: number) => {
              const external = isExternal(link.href, link.external);
              const telOrMail = isTelOrMail(link.href);

              if (external || telOrMail) {
                return (
                  <li key={`${link.title}-${idx}`}>
                    <a
                      href={link.href}
                      target={external && !telOrMail ? "_blank" : undefined}
                      rel={external && !telOrMail ? "noopener noreferrer" : undefined}
                      className="hover:underline"
                    >
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

        {/* Línea inferior */}
        <div className="mt-8 pt-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <div>© {year} BlinkX. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Twitter</a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
            <a href="https://github.com/Blinkx-Original" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}



