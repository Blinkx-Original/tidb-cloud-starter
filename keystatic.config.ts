// keystatic.config.ts
import { config, collection, fields, singleton } from '@keystatic/core';

/** Lee owner/name de env si usas GitHub; si no, usa storage local. */
function getRepoFromEnv(): { owner: string; name: string } | undefined {
  const combo = process.env.KEYSTATIC_GITHUB_REPO;
  if (combo) {
    const [owner, name] = combo.split('/');
    if (owner && name) return { owner, name };
  }
  const owner = process.env.KEYSTATIC_GITHUB_OWNER;
  const name = process.env.KEYSTATIC_GITHUB_NAME;
  if (owner && name) return { owner, name };
  return undefined;
}
const repo = getRepoFromEnv();
const storage =
  process.env.KEYSTATIC_STORAGE === 'github' && repo
    ? ({ kind: 'github', repo } as const)
    : ({ kind: 'local' } as const);

/** util: undefined/"" -> null */
const n = <T,>(v: T | undefined | null | ''): T | null =>
  v === undefined || v === '' ? null : (v as T);

export default config({
  storage,
  ui: { brand: { name: 'BlinkX' } },

  // Opcional: ajustes del "site" (lo que ya tenías)
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
      path: 'posts/*',
      slugField: 'slug', // <- el archivo se nombra por este campo
      format: { contentField: 'content' }, // frontmatter + body compatible con gray-matter
      schema: {
        title: fields.text({ label: 'Title', validation: { isRequired: true } }),
        slug: fields.slug({
          label: 'Slug',
          slugField: 'title',
          validation: { isRequired: true },
        }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        excerpt: fields.text({
          label: 'Excerpt',
          multiline: true,
          validation: { isRequired: true },
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: props => props.value || 'tag',
        }),
        category: fields.text({ label: 'Category', validation: { isRequired: true } }),
        cta_label: fields.text({ label: 'CTA Label', validation: { isRequired: false } }),
        // Deja este campo vacío o pon una URL http(s) válida; si escribes texto suelto dará error.
        cta_url: fields.url({ label: 'CTA URL', validation: { isRequired: false } }),
        content: fields.document({
          label: 'Content',
          formatting: true,
          links: true,
          dividers: true,
        }),
      },
      entryLayout: 'content',
      hooks: {
        beforeWrite: async ({ item }) => {
          // Normaliza para evitar undefined en Next.js
          return {
            ...item,
            cta_label: n<string>(item.cta_label as any),
            cta_url: n<string>(item.cta_url as any),
            tags: Array.isArray(item.tags) ? item.tags : [],
          };
        },
      },
    }),
  },
});



