// components/Footer.tsx
import Link from "next/link";
import React from "react";
import { footerLinks } from "./footerLinks";

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
  return (
    <footer className="w-full border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
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

        <div className="mt-6 text-xs text-gray-500">
          © {new Date().getFullYear()} BlinkX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

