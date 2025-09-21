// keystatic.config.ts  ← CREAR (en la raíz del repo)
import { config, collection, fields, singleton } from '@keystatic/core';

const storage =
  process.env.KEYSTATIC_STORAGE === 'github'
    ? {
        kind: 'github' as const,
        // Puedes setear estas envs si usas modo GitHub:
        // KEYSTATIC_GITHUB_OWNER, KEYSTATIC_GITHUB_NAME
        // o usar KEYSTATIC_GITHUB_REPO="owner/name"
        repo:
          process.env.KEYSTATIC_GITHUB_REPO ||
          `${process.env.KEYSTATIC_GITHUB_OWNER}/${process.env.KEYSTATIC_GITHUB_NAME}`,
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
        heroSubtitle: fields.text({ label: 'Hero H2', validation: { length: { max: 120 } } }),
        heroText: fields.text({ label: 'Hero texto', multiline: true }),
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
        cta_label: fields.text({ label: 'CTA Label', validation: { isOptional: true } }),
        cta_url: fields.url({ label: 'CTA URL', validation: { isOptional: true } }),
        // Guardamos el cuerpo como Markdown en el MISMO archivo .md (frontmatter + body)
        // Keystatic recomienda markdoc/mdx; usamos Markdoc con extensión .md para compatibilidad con gray-m
