// pages/[slug].tsx
import fs from "fs";
import path from "path";
import Head from "next/head";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

type Props = {
  title: string;
  html: string;
  description?: string;
  lastReviewed?: string;
};

const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

function kebabFromFilename(name: string) {
  // e.g. "ResponsibleLending.md" -> "responsiblelending"
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export default function LegalPage({ title, html, description, lastReviewed }: Props) {
  return (
    <>
      <Head>
        <title>{title} — BlinkX</title>
        {description && <meta name="description" content={description} />}
        <link rel="canonical" href={`https://blinkx.com${typeof window === "undefined" ? "" : window.location.pathname}`} />
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-10 prose">
        <h1>{title}</h1>
        {lastReviewed && (
          <p><em>Last reviewed: {lastReviewed}</em></p>
        )}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(LEGAL_DIR).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));

  const paths = files.map((file) => {
    const full = path.join(LEGAL_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    const fm = matter(raw).data as Record<string, any>;
    // Preferir front-matter 'slug' o 'url'; si no hay, usar nombre de archivo
    const rawSlug = (fm.slug || fm.url || `/${kebabFromFilename(file)}`) as string;
    const slug = rawSlug.replace(/^\/+/, ""); // sin barra inicial para Next
    return { params: { slug } };
  });

  return { paths, fallback: false }; // 404 si no existe
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const targetSlug = `/${params.slug}`;

  // Buscar por front-matter (slug o url)
  const files = fs.readdirSync(LEGAL_DIR).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));

  let fileMatch: string | null = null;
  let fmData: Record<string, any> | null = null;

  for (const file of files) {
    const full = path.join(LEGAL_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    const fm = matter(raw);
    const fmSlug = (fm.data.slug || fm.data.url || `/${kebabFromFilename(file)}`) as string;
    if (fmSlug.toLowerCase() === targetSlug.toLowerCase()) {
      fileMatch = full;
      fmData = fm.data as Record<string, any>;
      break;
    }
  }

  // Si no encontró por front-matter, intentar por nombre de archivo
  if (!fileMatch) {
    const candidate = files.find(f => `/${kebabFromFilename(f)}` === targetSlug.toLowerCase());
    if (candidate) {
      fileMatch = path.join(LEGAL_DIR, candidate);
      fmData = matter(fs.readFileSync(fileMatch, "utf8")).data as Record<string, any>;
    }
  }

  if (!fileMatch) {
    return { notFound: true };
  }

  const raw = fs.readFileSync(fileMatch, "utf8");
  const { content, data } = matter(raw);
  const processed = await remark().use(html).process(content);
  const htmlContent = processed.toString();

  return {
    props: {
      title: (data.title as string) ?? params.slug.replace(/-/g, " "),
      html: htmlContent,
      description: (data.description as string) ?? null,
      lastReviewed: (data.lastReviewed as string) ?? null,
    },
  };
}
