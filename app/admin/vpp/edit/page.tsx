import { getProductBySlug } from '@/lib/db';
import { buildMeta } from '@/lib/seo';

export const runtime = 'nodejs';

function ProductPreview({ product }: { product: Awaited<ReturnType<typeof getProductBySlug>> }) {
  if (!product) {
    return <p className="text-sm text-slate-500">Busca un slug para previsualizar el producto.</p>;
  }
  if (product.is_published !== 1) {
    return <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">Este producto está en borrador o no existe.</p>;
  }
  const meta = buildMeta(product);
  const frontmatter = (product.mdx_frontmatter_json && typeof product.mdx_frontmatter_json === 'object'
    ? product.mdx_frontmatter_json
    : {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{meta.title}</h2>
      <dl className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
        <div>
          <dt className="font-medium text-slate-500">Slug</dt>
          <dd>{product.slug}</dd>
        </div>
        {product.brand && (
          <div>
            <dt className="font-medium text-slate-500">Marca</dt>
            <dd>{product.brand}</dd>
          </div>
        )}
        {product.model && (
          <div>
            <dt className="font-medium text-slate-500">Modelo</dt>
            <dd>{product.model}</dd>
          </div>
        )}
        {product.sku && (
          <div>
            <dt className="font-medium text-slate-500">SKU</dt>
            <dd>{product.sku}</dd>
          </div>
        )}
      </dl>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">MDX frontmatter</h3>
        <pre className="max-h-64 overflow-auto rounded-xl bg-slate-900/90 p-4 text-xs text-slate-100">
          {JSON.stringify(frontmatter, null, 2)}
        </pre>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">MDX body (primeros 400 caracteres)</h3>
        <p className="rounded-xl bg-slate-100 p-4 text-xs text-slate-600">
          {(product.mdx_body || '').slice(0, 400) || '—'}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
          href={`/p/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver página pública
        </a>
        <code className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600">
          {`curl -X POST /api/admin/revalidate -H 'Content-Type: application/json' -d '{"slug":"${product.slug}"}'`}
        </code>
      </div>
    </div>
  );
}

export default async function AdminEditPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const slugParam = searchParams?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam || '';
  const product = slug ? await getProductBySlug(slug) : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-blue-500">Virtual Product Pages</p>
        <h1 className="text-3xl font-semibold text-slate-900">Editor (solo lectura)</h1>
        <p className="text-sm text-slate-500">
          Introduce un slug de producto para inspeccionar sus datos desde TiDB. Esta pantalla servirá como base para el editor
          con MDX.
        </p>
      </header>

      <form className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end">
        <label className="flex-1 text-sm font-medium text-slate-700">
          Slug del producto
          <input
            type="text"
            name="slug"
            defaultValue={slug}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-base text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="demo-slug"
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
        >
          Cargar
        </button>
      </form>

      <ProductPreview product={product} />
    </div>
  );
}
