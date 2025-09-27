import fs from "fs";
import path from "path";
import Head from "next/head";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import CommonLayout from "@/components/v2";

type Props = {
  title: string;
  html: string;
  description?: string | null;
  lastReviewed?: string | null;
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

/**
 * Renderiza páginas legales/políticas a partir de Markdown situado en `content/legal`.
 * Aplica clases `prose` para que los títulos, listas y tablas tengan estilo uniforme.
 */
export default function LegalPage({ title, html, description, lastReviewed }: Props) {
  return (
    <CommonLayout>
      <Head>
        <title>{title} — BlinkX</title>
        {description && <meta name="description" content={description} />}
      </Head>

      {/* El contenedor usa prose-neutral para una paleta legible */}
      <article className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto px-4 py-10">
        <h1>{title}</h1>
        {lastReviewed && (
          <p>
            <em>Last reviewed: {lastReviewed}</em>
          </p>
        )}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </CommonLayout>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(LEGAL_DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  const paths = files.map((file) => {
    const raw = fs.readFileSync(path.join(LEGAL_DIR, file), "utf8");
    const fm = matter(raw).data as Record<string, any>;
    const rawSlug = (fm.slug || fm.url || `/${kebabFromFilename(file)}`) as string;
    return { params: { slug: rawSlug.replace(/^\/+/, "") } };
  });
  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const files = fs.readdirSync(LEGAL_DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  const target = `/${params.slug}`.toLowerCase();

  let filePath: string | null = null;
  let dataFromFM: Record<string, any> = {};

  for (const f of files) {
    const full = path.join(LEGAL_DIR, f);
    const raw = fs.readFileSync(full, "utf8");
    const fm = matter(raw);
    const fmSlug = (fm.data.slug || fm.data.url || `/${kebabFromFilename(f)}`) as string;
    if (fmSlug.toLowerCase() === target) {
      filePath = full;
      dataFromFM = fm.data as Record<string, any>;
      break;
    }
  }
  if (!filePath) {
    const fallback = files.find((f) => `/${kebabFromFilename(f)}` === target);
    if (fallback) {
      filePath = path.join(LEGAL_DIR, fallback);
      dataFromFM = matter(fs.readFileSync(filePath, "utf8")).data as Record<string, any>;
    }
  }
  if (!filePath) return { notFound: true };

  const raw = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(raw);

  const processed = await remark()
    .use(remarkGfm) // soporta tablas, listas de tareas, autolinks…
    .use(remarkHtml, { sanitize: false })
    .process(content);

  return {
    props: {
      title: (data.title as string) ?? params.slug.replace(/-/g, " "),
      html: String(processed),
      description: (data.description as string) ?? null,
      lastReviewed: (data.lastReviewed as string) ?? null,
    },
  };
}
