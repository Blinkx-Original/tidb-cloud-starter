// components/v2/Footer.tsx
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import links from "../../content/footer/links.json";

type FooterLink = {
  title: string;
  href: string;
  external?: boolean;
};

function isExternalHref(href: string) {
  return /^(https?:\/\/|tel:|mailto:)/i.test(href);
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    // 👇 pb-10 asegura espacio extra debajo del recuadro para que no se corte
    <footer className="mt-16 max-w-7xl mx-auto px-4 pb-10 md:pb-12">
      <div className="rounded-2xl p-8 bg-white text-black border border-black/10">
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

        <nav aria-label="Footer" className="mt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {(links as FooterLink[]).map((link, idx) => {
              const external = link.external || isExternalHref(link.href);
              if (external) {
                const isHttp = /^https?:\/\//i.test(link.href);
                const externalAttrs = isHttp
                  ? { target: '_blank' as const, rel: 'noopener noreferrer' }
                  : {};
                return (
                  <li key={`${link.title}-${idx}`}>
                    <a
                      href={link.href}
                      target={isHttp ? "_blank" : undefined}
                      rel="noreferrer"
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


