// lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export type PostMeta = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  cta?: string; // futuro: manejar lead forms/CTAs
};

const POSTS_DIR = path.join(process.cwd(), 'posts');

function ensurePostsDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

export function getAllPostSlugs(): string[] {
  ensurePostsDir();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllPostsMeta(): PostMeta[] {
  ensurePostsDir();
  const metas: PostMeta[] = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const full = path.join(POSTS_DIR, filename);
      const file = fs.readFileSync(full, 'utf8');
      const { data } = matter(file);
      return {
        slug,
        title: String(data.title ?? slug),
        date: data.date ? String(data.date) : undefined,
        excerpt: data.excerpt ? String(data.excerpt) : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
        category: data.category ? String(data.category) : undefined,
        cta: data.cta ? String(data.cta) : undefined,
      };
    });

  // más reciente primero
  metas.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return metas;
}

export async function getPostBySlug(slug: string): Promise<{ meta: PostMeta; html: string }> {
  ensurePostsDir();
  const full = path.join(POSTS_DIR, `${slug}.md`);
  const file = fs.readFileSync(full, 'utf8');
  const { data, content } = matter(file);
  const processed = await remark().use(html).process(content);
  const htmlString = processed.toString();

  const meta: PostMeta = {
    slug,
    title: String(data.title ?? slug),
    date: data.date ? String(data.date) : undefined,
    excerpt: data.excerpt ? String(data.excerpt) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    category: data.category ? String(data.category) : undefined,
    cta: data.cta ? String(data.cta) : undefined,
  };

  return { meta, html: htmlString };
}
