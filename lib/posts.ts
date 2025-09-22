// lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getAllPostSlugs() {
  return fs.readdirSync(postsDirectory).map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  const processedContent = await remark().use(html).process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    title: matterResult.data.title || 'Untitled',
    date: matterResult.data.date || '',
    excerpt: matterResult.data.excerpt ?? null,
    tags: matterResult.data.tags ?? null,
    category: matterResult.data.category ?? null,
    cta_label: matterResult.data.cta_label ?? null,
    cta_url: matterResult.data.cta_url ?? null,
  };
}
