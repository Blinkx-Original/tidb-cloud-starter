// lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string | null;
  tags: string[] | null;
  category: string | null;
  cta_label: string | null;
  cta_url: string | null;
};

export function getAllPostSlugs() {
  // Para getStaticPaths
  return fs.readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => ({
      params: { slug: fileName.replace(/\.md$/, '') },
    }));
}

export function getAllPostsMeta(): PostMeta[] {
  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.md'));

  const metas: PostMeta[] = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const file = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(file);

    const tags = Array.isArray(data.tags)
      ? data.tags
      : data.tags
      ? [String(data.tags)]
      : null;

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || '',
      excerpt: data.excerpt ?? null,
      tags: tags ?? null,
      category: data.category ?? null,
      cta_label: data.cta_label ?? null,
      cta_url: data.cta_url ?? null,
    };
  });

  // Ordenar por fecha (desc). Si no hay fecha, al final.
  metas.sort((a, b) => {
    const ad = a.date ? new Date(a.date).getTime() : 0;
    const bd = b.date ? new Date(b.date).getTime() : 0;
    return bd - ad;
  });

  return metas;
}

export async function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);
  const processedContent = await remark().use(html).process(matterResult.content);
  const contentHtml = processedContent.toString();

  const tags = Array.isArray(matterResult.data.tags)
    ? matterResult.data.tags
    : matterResult.data.tags
    ? [String(matterResult.data.tags)]
    : null;

  return {
    slug,
    contentHtml,
    title: matterResult.data.title || 'Untitled',
    date: matterResult.data.date || '',
    excerpt: matterResult.data.excerpt ?? null,
    tags: tags ?? null,
    category: matterResult.data.category ?? null,
    cta_label: matterResult.data.cta_label ?? null,
    cta_url: matterResult.data.cta_url ?? null,
  };
}
