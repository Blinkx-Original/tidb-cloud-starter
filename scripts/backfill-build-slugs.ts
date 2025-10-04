import 'dotenv/config';
import { fetchProductsMissingSlug, updateProductSlug } from '@/lib/sync/tidb';
import { ensureSlug } from '@/lib/sync/transform';

async function main() {
  const rows = await fetchProductsMissingSlug();
  if (!rows.length) {
    console.log('No hay productos sin slug.');
    return;
  }
  let updated = 0;
  for (const row of rows) {
    const slug = ensureSlug(row.name, row.slug, row.id);
    await updateProductSlug(row.id, slug);
    updated += 1;
    console.log(`Producto ${row.id} actualizado con slug ${slug}`);
  }
  console.log(`Slugs generados para ${updated} productos.`);
}

main().catch((error) => {
  console.error('Error al generar slugs', error);
  process.exit(1);
});
