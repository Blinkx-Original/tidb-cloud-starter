// pages/sitemap.xml.tsx
import { GetServerSideProps } from "next";
import { query } from "@/lib/db";

// 🔧 Función que arma el XML
function generateSiteMap(products: { slug: string }[]) {
  const baseUrl = "https://yourdomain.com"; // 👈 cambia esto a tu dominio real

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${baseUrl}/</loc>
      <priority>1.0</priority>
    </url>
    ${products
      .map((p) => {
        return `
      <url>
        <loc>${baseUrl}/product/${p.slug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>0.8</priority>
      </url>`;
      })
      .join("")}
  </urlset>`;
}

// 🚀 SSR para que Google siempre vea datos frescos
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Traer hasta 50k productos (límite de sitemap por archivo XML)
  const products = await query<{ slug: string }>(
    `SELECT slug FROM products LIMIT 50000`
  );

  const sitemap = generateSiteMap(products);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

// El componente no renderiza nada
export default function SiteMap() {
  return null;
}
