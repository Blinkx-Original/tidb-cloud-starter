// pages/blog/[slug].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import CommonLayout from '@/components/v2/Layout';
import { getAllPostSlugs, getPostData } from '@/lib/posts';
import StickyFooterCTA from '@/components/v2/StickyFooterCTA';
import { UI } from '@/lib/uiConfig';

type PostProps = {
  title: string;
  date: string;
  contentHtml: string;
  excerpt: string | null;
  tags: string[] | null;
  category: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

export default function PostPage({
  title,
  date,
  contentHtml,
  excerpt,
  tags,
  category,
  ctaLabel,
  ctaUrl,
}: PostProps) {
  return (
    <CommonLayout>
      <Head>
        <title>{title} — BlinkX Blog</title>
        {excerpt && <meta name="description" content={excerpt} />}
      </Head>

      <article className="prose max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <div className="text-sm opacity-70 mb-6">{date}</div>
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        {tags && tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="badge badge-outline">
                {t}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* spacer to avoid overlap with sticky bar */}
      {UI.stickyFooter.enabledOnBlog && <div className="h-24 sm:h-20" />}

      {UI.stickyFooter.enabledOnBlog && (
        <StickyFooterCTA
          title={title}
          buttonLabel={ctaLabel || 'Go to offer'}
          buttonHref={ctaUrl || '/contact'}
          backgroundClass={UI.stickyFooter.background}
        />
      )}
    </CommonLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostSlugs();
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const data = await getPostData(slug);

  return {
    props: {
      title: data.title,
      date: data.date,
      contentHtml: data.contentHtml,
      excerpt: data.excerpt ?? null,
      tags: data.tags ?? null,
      category: data.category ?? null,
      ctaLabel: data.cta_label ?? null,
      ctaUrl: data.cta_url ?? null,
    },
  };
};

