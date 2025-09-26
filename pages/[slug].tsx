// pages/[slug].tsx
import fs from "fs";
import path from "path";
import Head from "next/head";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";

type Props = {
  title: string;
  html: string;
  description?: string;
  lastReviewed?: string;
};

const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

function kebabFromFilename(name: string) {
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
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-10 prose prose-neutral">
        <h1>{title}</h1>
        {lastReviewed && <p><em>Last reviewed: {lastReviewed}</em></p>}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(LEGAL_DIR).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));

  const paths = files.map((file) => {
    const raw = fs.readFileSync(path.join(LEGAL_DIR, file), "utf8");
    const fm = matter(raw).data as Record<string, any>;
    const rawSlug = (fm.slug || fm.url || `/${kebabFromFilename(file)}`) as string;
    const slug = rawSlug.replace(/^\/+/, "");
    return { params: { slug } };
  });

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const files = fs.readdirSync(LEGAL_DIR).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));
  const target = `/${params.slug}`.toLowerCase();

  let filePath: string | null = null;
  let fmData: Record<string, any> = {};

  for (const f of files) {
    const full = path.join(LEGAL_DIR, f);
    const raw = fs.readFileSync(full, "utf8");
    const fm = matter(raw);
    const fmSlug = (fm.data.slug || fm.data.url || `/${kebabFromFilename(f)}`) as string;
    if (fmSlug.toLowerCase() === target) {
      filePath = full;
      fmData = fm.data as Record<string, any>;
      break;
    }
  }

  if (!filePath) {
    const fallback = files.find(f => `/${kebabFromFilename(f)}` === target);
    if (fallback) {
      filePath = path.join(LEGAL_DIR, fallback);
      fmData = matter(fs.readFileSync(filePath, "utf8")).data as Record<string, any>;
    }
  }

  if (!filePath) return { notFound: true };

  const raw = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(raw);

  // Render Markdown → HTML (con GFM: tablas, autolinks, etc.)
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content);
  const html = String(processed);

  return {
    props: {
      title: (data.title as string) ?? params.slug.replace(/-/g, " "),
      html,
      description: (data.description as string) ?? null,
      lastReviewed: (data.lastReviewed as string) ?? null,
    },
  };
}

