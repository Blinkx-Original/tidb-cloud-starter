// keystatic.config.ts
import { config, collection, fields, singleton } from '@keystatic/core';

/** Lee owner/name del repo desde env (KEYSTATIC_GITHUB_REPO o OWNER/NAME). */
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
const branch = process.env.KEYSTATIC_GITHUB_BRANCH || 'main';

// Si faltan las envs de GitHub, caemos a local (en prod no podrá escribir).
const storage =
  process.env.KEYSTATIC_STORAGE === 'github' && repo
    ? ({ kind: 'github', repo, branch } as const)
    : ({ kind: 'local' } as const);

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
      path: 'posts/*',
      slugField: 'slug', // el archivo se nombra por este campo
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Title', validation: { isRequired: true } }),
        slug: fields.text({
          label: 'Slug',
          validation: { isRequired: true },
          description: 'Usa guiones, ej: "mi-articulo-nuevo"',
        }),
        date: fields.date({
          label: 'Date',
          validation: { isRequired: true },
          description: 'Usa el selector o formato ISO: YYYY-MM-DD',
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          multiline: true,
          validation: { isRequired: true },
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value || 'tag',
        }),
        category: fields.text({ label: 'Category', validation: { isRequired: true } }),
        cta_label: fields.text({ label: 'CTA Label', validation: { isRequired: false } }),
        // texto opcional para evitar validador de URL
        cta_url: fields.text({
          label: 'CTA URL',
          validation: { isRequired: false },
          description: 'Opcional. Si usas, pon una URL completa (https://...)',
        }),
        content: fields.document({
          label: 'Content',
          formatting: true,
          links: true,
          dividers: true,
        }),
      },
      entryLayout: 'content',
    }),
  },
});

