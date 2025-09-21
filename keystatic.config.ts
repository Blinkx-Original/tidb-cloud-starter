// keystatic.config.ts  ← REEMPLAZAR (archivo completo)
import { config, collection, fields, singleton } from '@keystatic/core';

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
// Si faltan las envs de GitHub, caemos a modo local aunque KEYSTATIC_STORAGE=github.
const storage =
  process.env.KEYSTATIC_STORAGE === 'github' && repo
    ? ({ kind: 'github', repo } as const)
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
      slugField: 'title',
      path: 'posts/*',
      // Un único archivo .md con frontmatter + body (compatible con gray-matter)
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
          validation: { isRequired: false }, // <- corregido
        }),
        cta_url: fields.url({
          label: 'CTA URL',
          validation: { isRequired: false }, // <- corregido
        }),
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
      entryLayout: 'content',
    }),
  },
});


