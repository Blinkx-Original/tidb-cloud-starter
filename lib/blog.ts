import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export type BlogMeta = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
};

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllPostsMeta(): BlogMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const fullPath = path.join(BLOG_DIR, filename);
      const file = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(file);
      return {
        slug,
        title: String(data.title || slug),
        date: data.date ? String(data.date) : undefined,
        excerpt: data.excerpt ? String(data.excerpt) : undefined,
      } as BlogMeta;
    })
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .reverse();
}

export async function getPostBySlug(slug: string): Promise<{ meta: BlogMeta; html: string }> {
  const fullPath = path.join(BLOG_DIR, `${slug}.md`);
  const file = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(file);
  const processed = await remark().use(html).process(content);
  const htmlString = processed.toString();
  return {
    meta: {
      slug,
      title: String(data.title || slug),
      date: data.date ? String(data.date) : undefined,
      excerpt: data.excerpt ? String(data.excerpt) : undefined,
    },
    html: htmlString,
  };
}
