// keystatic.config.ts – must be at the root of the repo
import { config, collection, fields, singleton } from '@keystatic/core';

const storage =
  process.env.KEYSTATIC_STORAGE === 'github'
    ? {
        kind: 'github' as const,
        repo: {
          owner: process.env.KEYSTATIC_GITHUB_OWNER || '',
          name: process.env.KEYSTATIC_GITHUB_NAME || '',
          branch: process.env.KEYSTATIC_GITHUB_BRANCH || 'main',
        },
      }
    : { kind: 'local' as const };

export default config({
  storage,
  ui: {
    brand: { name: 'BlinkX' },
  },
  singletons: {
    site: singleton({
      label: 'Site settings',
      path: 'content/site',
      format: { data: 'json' },
      schema: {
        heroTitle: fields.text({ label: 'Hero H1' }),
        heroSubtitle: fields.text({
          label: 'Hero H2',
          validation: { length: { max: 120 } },
        }),
        heroText: fields.text({ label: 'Hero text', multiline: true }),
      },
    }),
  },
  collections: {
    posts: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date' }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value || 'tag',
        }),
        category: fields.text({ label: 'Category' }),
        cta_label: fields.text({
          label: 'CTA Label',
          validation: { isRequired: false },
        }),
        cta_url: fields.url({
          label: 'CTA URL',
          validation: { isRequired: false },
        }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
  },
});
