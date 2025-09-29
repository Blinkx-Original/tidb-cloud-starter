
import type { Profile } from './types';
import { slugify } from './slug';

export const profiles: Record<string, Profile> = {
  products: {
    name: 'BlinkX – Products',
    table: 'products',
    primaryKey: 'id',
    updatedAt: 'updated_at',
    sqlFilter: '',
    algoliaIndex: 'catalog__items',
    objectIdPrefix: 'prod_',
    fields: [
      { column: 'id',            attr: 'id' },
      { column: 'sku',           attr: 'sku' },
      { column: 'name',          attr: 'title' },
      { column: 'description',   attr: 'description' },
      { column: 'image_url',     attr: 'image_url' },
      { column: 'category_name', attr: 'category' },
      { column: 'category_slug', attr: 'category_slug' },
      { column: 'price_eur',     attr: 'price' },
      { column: 'slug',          attr: 'slug' },
      { column: 'updated_at',    attr: 'updated_at' },
    ],
    transform: (row) => {
      const slug = row.slug || (row.sku ? slugify(row.sku) : slugify(row.name || String(row.id)));
      return {
        slug,
        url: `/product/${slug}`,
        rating: 0,
        country: 'US', state: null, city: null,
      };
    },
  },
};
