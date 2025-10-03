
# 📘 Catalog Architecture – Governance & SOP

This document explains the **architecture, naming conventions, and workflow** for our Catalog system.  
It is the **reference guide** for development, SEO, affiliate integration, and lead management.

---

## 1. Concept

The Catalog is the **core of SEO Armageddon**.  
- Every **Product** represents an opportunity to monetize:  
  - Affiliate item (Amazon, Capterra, SaaS tools, and so on.)  
  - Lead Management offer (ice machines, forklifts for rent, etc.)  
  - Dropshipping item (this is real supplier inventory).  
- Products are always grouped into **Categories**.  
- Each Product automatically generates:  
  1. A **Card** (square on the homepage or category page).  
  2. A **Detail Page** (`/product/[slug]`).  
  3. Zero or more **Listings** (affiliate links, offers, vendors).

---

## 2. Key Definitions

- **Product**  
  - Stored in the database table `products`.  
  - Columns: `id, sku, name, slug, description, price, price_eur, image_url, category_name, category_slug`.  
  - Can be affiliate, lead management, or dropshipping. We always call it *Product*.  

- **Card**  
  - The visual square on the homepage or category page.  
  - Displays `image_url`, `name`, `category_name`, `price`.  
  - Clicking a card opens the Product’s **Detail Page**.  

- **Detail Page**  
  - File: `pages/product/[slug].tsx`.  
  - URL format: `/product/<slug>`.  
  - Shows product info and its **Listings**.  
  - Works like Capterra or Amazon product pages.  

- **Listing**  
  - Stored in the `listings` table.  
  - Linked to a product by `product_id`.  
  - Columns: `id, product_id, title, url, price, source`.  
  - Each listing represents one offer (affiliate program, lead form, supplier link).  

- **Category Page**  
  - Future implementation: `pages/category/[slug].tsx`.  
  - Shows only products with the same `category_slug`.  

- **Homepage**  
  - File: `pages/index.tsx`.  
  - Displays a feed of product cards (paginated).  
  - This is the current Vercel homepage.

---

## 3. Technical Architecture

- **Frontend**: Next.js 13 + React 18, deployed on Vercel.  
- **Database**: TiDB Cloud (schema `bookshop`).  
- **DB Access**: `lib/db.ts` using `mysql2/promise`.  
- **API Endpoints**:  
  - `pages/api/products.ts` → Returns products (paginated).  
  - `pages/api/product/[slug].ts` (optional) → Returns single product + listings.  

---

## 4. Workflow

1. **Upload Products**  
   - Data comes from CSV import into `bookshop.products`.  

2. **Create Listings**  
   - Add affiliate offers or lead management offers into `bookshop.listings`.  
   - Example:  
     ```sql
     INSERT INTO listings (product_id, title, url, price, source)
     VALUES (1, 'Demo Offer', 'https://example.com', 1499.00, 'Affiliate');
     ```

3. **Homepage**  
   - Displays products as cards.  

4. **Detail Page**  
   - `/product/[slug]` shows the product’s info and its listings.  

---

## 5. Naming Conventions

We always use the same words:  

- **Product** = any item in the system (affiliate, dropshipping, lead).  
- **Card** = the homepage/category square.  
- **Detail Page** = `/product/[slug].tsx`.  
- **Listing** = one affiliate/offer entry linked to a Product.  
- **Category Page** = product cards filtered by category.  

---

## 6. Editing Guidelines

- **Homepage design** → `pages/index.tsx`.  
- **Card design** → `components/v2/Cards/ShoppingItemCardList.tsx`.  
- **Detail Page design** → `pages/product/[slug].tsx`.  
- **Categories**  
  - Currently still use “Bookshop / Bookstore” text.  
  - Must be replaced with our categories.  
  - File: `pages/index.tsx` and `components/v2/Layout.tsx`.  
- **Menus / Headers** → Defined in `components/v2/Layout.tsx`.  
- **Site Title** → `<title>` in `pages/index.tsx` and `[slug].tsx`.  

---
# 🔝 Header & Homepage Title Customization (Copy–paste this whole block into your README)

This section explains how to customize the **site header** (logo + title) and the **homepage heading/subtitle**. Both are at the very top of the site.

---

## Global Header (visible on all pages)

**File:** `components/v2/Layout/Header.tsx`  
Contains:
- Logo icon (currently `BookOpenIcon` from `@heroicons/react`)
- Site title text (currently `BlinkX`)
- Navigation (menu, cart, etc.)

### Change the site title
Open `components/v2/Layout/Header.tsx` and find the brand block:

<NextLink href='/' className='btn btn-ghost normal-case text-xl'>
  <BookOpenIcon className='w-6 h-6' />
  BlinkX
</NextLink>

Replace `BlinkX` with your brand (e.g., `BlinkX Catalog`, `Industrial Marketplace`, etc.).  
Longer text works, but keep it short for headers.

### Change the logo (icon → PNG/JPG/SVG)
Current line:

<BookOpenIcon className='w-6 h-6' />

To use your own logo image, upload the file to `/public/logo.png` and replace the icon with:

<img src="/logo.png" alt="BlinkX Logo" className="w-6 h-6" />

(Adjust size via the Tailwind classes, e.g., `h-8 w-auto`.)

👉 Any page wrapped with the global layout (`components/v2/Layout/index.tsx`) will show this header automatically.

---

## Homepage Heading (H1 + subtitle)

**File:** `pages/index.tsx`  
Find the heading block near the top of the page:

<h1 className="text-2xl font-bold">BlinkX Catalog</h1>
<p className="text-gray-500">Products, affiliates, and lead listings.</p>

- Change `BlinkX Catalog` to update the main **H1** on the homepage.
- Change the paragraph text to update the subtitle.
- You can add more elements here (another `h2`, a CTA button, a longer intro) if needed.

👉 This only affects the homepage (`/`). Other pages (product detail, categories) still show the global header from `Header.tsx`.

---

## Page <title> (browser tab text)

Each page sets its `<title>` inside a React `<Head>` block.

Example in `pages/index.tsx`:

<Head>
  <title>BlinkX – Industrial Catalog</title>
  <meta name="description" content="BlinkX Catalog Homepage" />
</Head>

Example in `pages/product/[slug].tsx`:

<Head>
  <title>{product?.name} – BlinkX</title>
  <meta name="description" content={product?.description || product?.name} />
</Head>

---

## Quick Reference

- Header title text → edit in `components/v2/Layout/Header.tsx`
- Header logo image → replace icon with `<img src="/logo.png" />` and add file to `/public`
- Homepage H1/subtitle → edit in `pages/index.tsx`
- Browser tab `<title>`/description → edit `<Head>` in each page


---

## 7. Content Structure

- Above the cards (homepage or category) we must have:  
  - An **H1** → main keyword / intro.  
  - Optional **H2/H3** → supporting text.  
- This header text is editable directly in the React components.  

---

## 8. Dummy vs Real Data

- **Dummy Data**: used for testing (e.g., `Demo Offer`, `https://example.com`).  
- **Real Data**: loaded by CSV or direct SQL insert.  

---

## 9. Vision

- Extend with:  
  - **Category pages** (`/category/[slug]`).  
  - **Search and filters** (by category, price, attributes).  
  - **Affiliate monetization**: every listing links to external programs.  
  - **Lead management**: listings become quote forms (RFP / RFQ).  
- Unified Catalog → covers affiliate, dropshipping, and lead management.

---

# ✅ Summary

- Every **Product** = card + detail page + listings.  
- Homepage shows **Cards**.  
- Cards link to **Detail Pages**.  
- Detail Pages show **Listings**.  
- Categories group Products.  
- All content editable via specific React files and TiDB tables.  

This is the **Catalog Architecture SOP**.  
It defines naming, structure, and workflow to avoid confusion.  
Always refer here before making changes.


# Catalog Architecture: Domain (Products/Categories) vs Presentation (UI/Analytics)

Goal: any change to design/UX (search pill, header, sticky footer, fonts, H1/H2, analytics) must not affect the product & category logic—and database/search changes must not force UI rewrites.

This README section documents the separation we implemented and how to work within it.

TL;DR

Domain/Data lives in /lib

Types: lib/domain.ts

DB access: lib/dbClient.ts

Repository: lib/repositories/catalog.ts (the only place with SQL)

Presentation/UI lives in /components + /pages

No SQL, no mysql2 imports here.

Uses UI config only: lib/uiConfig.ts (headings, sticky options, colors)

Telemetry via lib/analytics.ts (client-only safeTrack)

Search is case-insensitive and index-friendly (large catalog ready).

DB adds generated lowercase columns + indexes.

Repo queries use name_lower/description_lower (not LOWER(name)).

Rule of thumb

If you touch SQL or what data is returned, change only the repo.

If you touch how things look/animate/track, change UI + uiConfig only.

Folder Map (key files)
lib/
  domain.ts                 # Product & Category TypeScript types
  dbClient.ts               # MySQL/TiDB pool + query helper
  analytics.ts              # client-only safe wrapper for @vercel/analytics track()
  uiConfig.ts               # presentation knobs (headings, sticky footer options)
  repositories/
    catalog.ts              # all SQL for products/categories/search

components/
  v2/
    Layout/
      Header.tsx            # navbar; uses SearchBar
      index.tsx             # CommonLayout wrapper (Header + Footer)
    StickyFooterCTA.tsx     # presentational sticky CTA bar (animated)
    breadcrumbs.tsx         # UI-only breadcrumbs
    SearchBar.tsx           # presentational; routes to /search; tracks submit
    trackers/
      SearchAnalytics.tsx   # fires 'search' event on results page

pages/
  index.tsx                 # home (uses repo only via dedicated loaders if needed)
  categories.tsx            # lists categories via CatalogRepo
  category/[slug].tsx       # lists products in a category via CatalogRepo
  product/[slug].tsx        # product detail via CatalogRepo; mounts StickyFooterCTA
  search.tsx                # server-rendered search using CatalogRepo.searchProducts
  blog/index.tsx            # blog listing (markdown metadata)
  blog/[slug].tsx           # blog detail; mounts StickyFooterCTA

Ownership & Boundaries
Domain/Data Layer (authoritative)

lib/domain.ts

export type Product = {
  id: number; name: string; slug: string;
  image_url: string | null;
  price_eur: number | null; description: string | null;
  category_name: string | null; category_slug: string | null;
};

export type Category = { name: string; slug: string; count?: number };


lib/dbClient.ts
Centralizes the MySQL/TiDB pool and exposes a typed query<T>().
UI never imports mysql2 directly.

lib/repositories/catalog.ts (the only place with SQL)

getAllCategories()

getProductsByCategorySlug(slug)

getProductBySlug(slug)

searchProducts(q) — case-insensitive, index-friendly

getRecentProducts(limit)

Do not import mysql2 or write SQL anywhere else.
Do add new data access methods here (e.g., filters, sort).

Presentation Layer (pure UI)

lib/uiConfig.ts controls appearance/behavior knobs:

export const UI = {
  headings: {
    homeTitleTag: 'h1' as const,
    productTitleTag: 'h2' as const,
    categoryTitleTag: 'h2' as const,
  },
  stickyFooter: {
    enabledOnProduct: true,
    enabledOnBlog: true,
    background: 'bg-gray-100',
  },
};


Pages/components read from UI but never embed SQL or domain rules.

Components (SearchBar, StickyFooterCTA, Header, etc.)

Are presentational: styling, layout, routing, analytics.

SearchBar submits to /search and fires safeTrack('search_submit', {...})—it does not fetch data.

StickyFooterCTA is configurable (title, button label/href, background) and includes a 2s slide-up + fade-in animation via Tailwind.

Pages orchestrate:

Data server-side (SSR/SSG) via CatalogRepo only.

Render UI using components + UI config.

Example (excerpt from pages/category/[slug].tsx):

export const getServerSideProps = async (ctx) => {
  const slug = String(ctx.params?.slug || '');
  const products = await CatalogRepo.getProductsByCategorySlug(slug);
  return { props: { slug, products } };
};

Telemetry Layer

lib/analytics.ts exposes safeTrack(name, props) (client-only).
Avoids SSR import issues; UI can call analytics without touching domain.

Events we emit

search_submit — when the header form is submitted.
Props: { query, from: 'header' }

search — when /search renders results.
Props: { query, results, source: 'page' }

search_result_click — when a result card is clicked.
Props: { query, productId, slug, position }

Repositories never import analytics. Analytics lives strictly in UI.

Case-Insensitive & Scalable Search
Database (TiDB) migration (done)

We added generated lowercase columns and indexes:

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name_lower VARCHAR(255)
  GENERATED ALWAYS AS (LOWER(name)) VIRTUAL;

CREATE INDEX IF NOT EXISTS idx_products_name_lower
  ON products (name_lower);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS description_lower TEXT
  GENERATED ALWAYS AS (LOWER(description)) VIRTUAL;

CREATE INDEX IF NOT EXISTS idx_products_description_lower_prefix
  ON products (description_lower(191));


Why:

Using LOWER(column) directly in WHERE prevents index usage.

Generated columns + indexes keep comparisons case-insensitive and fast.

Repository query (index-friendly)

lib/repositories/catalog.ts uses UNION to allow the name index to be used:

async searchProducts(q: string): Promise<Product[]> {
  const trimmed = (q || '').trim().toLowerCase();
  if (!trimmed) return [];
  const term = `%${trimmed}%`;

  const sql = `
    SELECT id, name, slug, image_url, price_eur, description, category_name, category_slug
    FROM products
    WHERE name_lower LIKE ?
    UNION
    SELECT id, name, slug, image_url, price_eur, description, category_name, category_slug
    FROM products
    WHERE description_lower LIKE ?
    ORDER BY id DESC
    LIMIT 100
  `;

  return await query<Product>(sql, [term, term]);
}


Behavior

Matches irrespective of case (Hydraulic, hydraulic, HYD).

UNION de-duplicates rows that match both name and description.

First SELECT can use idx_products_name_lower; second may use the prefix index.

Example Flows
A) Header search → /search

User types in SearchBar (UI only).

safeTrack('search_submit', { query, from: 'header' }).

Router navigates to /search?q=....

pages/search.tsx runs on server: calls CatalogRepo.searchProducts(q).

Renders cards; mounts SearchAnalytics which fires safeTrack('search', { query, results }).

Clicking a card fires safeTrack('search_result_click', {...}).

B) Category detail

Page calls CatalogRepo.getProductsByCategorySlug(slug) in getServerSideProps.

UI renders via cards; no analytics/domain logic inside repo.

C) Product detail

Page calls CatalogRepo.getProductBySlug(slug).

UI renders image, price, description + StickyFooterCTA.

Sticky footer animates with Tailwind keyframes, uses UI.stickyFooter.background.

Change Without Risk — Playbook
You can change these without touching the repo:

Header layout, pills, colors, fonts, H1/H2 choices → components + lib/uiConfig.ts.

Sticky footer styles/animation/button text → StickyFooterCTA.tsx + uiConfig.ts.

Analytics events/props → lib/analytics.ts + UI components/pages.

Tailwind animation timing → tailwind.config.ts (we ship slide-up-fade-in at 2s).

You can evolve data/search without touching UI:

Add fields to Product/Category → update lib/domain.ts + repo queries.

Add filters/sort/pagination → add methods or params in CatalogRepo.

Optimize SQL/indexes → change only the repo and/or DB; pages keep the same contract.

Conventions & Rules

No SQL outside the repository.

No analytics inside the repository.

Pages do SSR/SSG and pass plain data to components.

Components are pure UI (accept props, render; may call safeTrack and router).

UI decisions centralized in lib/uiConfig.ts (headings, sticky settings, classes).

Types live in lib/domain.ts (single source of truth).

All external links use target="_blank" + rel="noopener noreferrer".

Environment (for completeness)

Required (Vercel → Project Settings → Environment Variables):

TIDB_HOST=gateway01.<region>.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=<user>
TIDB_PASSWORD=<maybe empty>
TIDB_DB=bookshop
ALGOLIA_APP_ID=<algolia app id>
ALGOLIA_ADMIN_API_KEY=<algolia admin key>
ALGOLIA_SEARCH_API_KEY=<algolia search-only key>
ALGOLIA_INDEX_PRIMARY=products_primary
ALGOLIA_INDEX_BLUE=products_blue
ALGOLIA_INDEX_GREEN=products_green
NEXT_PUBLIC_ALGOLIA_APP_ID=<algolia app id>
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=<algolia search-only key>
NEXT_PUBLIC_ALGOLIA_INDEX_PRIMARY=products_primary
ADMIN_DASH_PASSWORD=<strong random password>


Optional:

NEXT_PUBLIC_SITE_URL=<for canonical URLs/OG tags/sitemaps>
REVALIDATE_SECRET=<if you will call /api/admin/revalidate>

### Sync orchestrator (TiDB ⇄ Algolia)

- **Panel `/admin`**: protegido por `ADMIN_DASH_PASSWORD`. Permite lanzar sincronizaciones manuales, ver checkpoints y consultar los últimos registros.
- **Endpoints API**
  - `POST /api/admin/sync-algolia` – lanza sincronización manual Algolia.
  - `POST /api/admin/cron-algolia` – pensado para Vercel Cron/Cloudways (acepta `batchSize` y `maxDurationMs`).
  - `GET /api/admin/sync-algolia` – resumen del último run + flag `running`.
  - `GET /api/admin/revalidate?secret=...&path=/p/slug` – revalida ISR cuando haya cambios (opcional).
- **Checkpoints**: tabla `sync_checkpoint` se actualiza con `last_updated_at` por destino (`algolia`).
- **Logs**: tabla `sync_log` almacena `ok`, `failed`, notas y `targetIndex` (Algolia blue/green).
- **Scripts CLI**
  - `yarn sync:algolia` → ejecuta `scripts/sync-tidb-to-algolia.ts`.
  - `yarn sync:slugs` → ejecuta `scripts/backfill-build-slugs.ts` para autogenerar slugs faltantes.
- **Algolia**: estrategia blue/green. Se clona el índice primario al alterno, se aplican cambios incrementales y luego se copia al alias `ALGOLIA_INDEX_PRIMARY`, preservando réplicas (`_price_asc`, `_price_desc`).

Testing Checklist

 Can change UI.headings.* (e.g., h2 → h1) with no repo code touched.

 Style changes to Header/Sticky don’t affect query results.

 /search?q=hyd returns same results regardless of case.

 EXPLAIN SELECT ... WHERE name_lower LIKE '%term%'; shows idx_products_name_lower.

 Adding a new field to Product only requires changing lib/domain.ts + repo SELECTs.

Future Extensions

Algolia/OpenSearch adapter: add lib/search/adapter.ts implementing search(q): Product[], then switch CatalogRepo.searchProducts to use it—UI remains unchanged.

Ranking: split UNION into weighted results (e.g., names first), still within the repo.

Caching: add SWR on client or server-side caching in repo; UI unaffected.

By following this structure, we keep a clean, scalable boundary: design moves fast without risking data logic, and data/search optimizes without breaking the UI.


Dónde cambiar textos y enlaces
Home (pages/index.tsx)

Hero (título, subtítulo, placeholder de búsqueda):

Se renderiza con SearchHero.

Cambias los textos en pages/index.tsx al pasarle props:

<SearchHero
  title="Tu título aquí"
  subtitle="Tu subtítulo aquí"
  // si el componente soporta placeholder/ariaLabel, pásalos aquí
/>


“Píldoras” / bloques de links (PillBlock):

También se pasan desde pages/index.tsx como array segments (o lista de pills).

Ahí mismo editas labels y href de cada pill.

Sticky footer (botón azul)

Componente: components/v2/StickyFooterCTA.tsx

Texto y link del botón se pasan desde cada página donde lo uses:

<StickyFooterCTA title="…" buttonLabel="Ir a la oferta" buttonHref="/…" />


Activación por defecto (blog, etc.): suele venir de lib/uiConfig.ts (si existe).
Cambias ahí enabledOnBlog, textos por defecto, color de fondo, etc.

Header / Menú hamburguesa

Logo y items de menú: components/v2/Header.tsx (o Nav.tsx / MobileMenu.tsx).

Edita los labels y href de las entradas del menú dentro del componente.
(Si hay un archivo lib/nav.ts, los items pueden estar centralizados ahí.)

Footer

Estructura y enlaces: components/v2/Footer.tsx

Dentro verás un array/lista de links (secciones: Company, Legal, etc.). Editas label y href ahí.

Páginas legales (el contenido de esos links):

Archivos Markdown en /content/legal/*.md (o .mdx).

Cambias el texto directamente en esos .md (Title, body, etc.).

La página que los renderiza es pages/[slug].tsx (ya lo tienes).

Página de producto

Archivo: pages/product/[slug].tsx

Columna derecha (título, precio, categoría, descripción corta): vienen de TiDB (tu CSV).

Si necesitas cambiar textos, edítalos en el Excel que importas a TiDB.

Botón único azul (texto y link):

Campos en DB: cta_label, cta_url (si existen, se usan).

Fallback automático: “Ver más en {categoría}” → /category/{slug}.

Cuerpo largo (debajo): hoy usa description como placeholder.

Cuando quieras, podrás usar MDX:

en TiDB (long_content_mdx) o

archivo /content/products/<slug>.mdx si decides tenerlo en repo.

Búsqueda (placeholder del input)

Componente: components/v2/SearchHero.tsx

Dentro verás el placeholder y aria-label. Cámbialos allí si no se pasan por props.

Favicon / OG por defecto

Favicon: public/favicon.ico (ya sirve en /favicon.ico).

OG fallback (Open Graph): public/og-default.png (1200×630).

Se referencia desde tu layout (ver abajo).

Metas globales + canonical

Layout: components/v2/CommonLayout.tsx (o Layout.tsx en esa carpeta)

Ahí están <title>, <meta name="description">, <link rel="canonical">, OG/Twitter fallback.

Cambias los textos globales ahí. Las páginas pueden sobreescribir.

Archivo de colores (azul eléctrico)

Tailwind: tailwind.config.ts

Color accent (azul) y sombras:

colors: { accent: { DEFAULT: '#2f81f7', hover: '#3b82f6', ring: '#60a5fa' } }


Si querés otro tono, cámbialo una sola vez aquí.

Rutas “de sistema” (no se tocan casi nunca)

Sitemap dinámico: pages/sitemap.xml.ts

Usa NEXT_PUBLIC_SITE_URL; se actualiza solo con la DB.

Robots.txt: pages/robots.txt.ts

También usa NEXT_PUBLIC_SITE_URL.

Variables de entorno: en Vercel → Project → Settings → Environment Variables

NEXT_PUBLIC_SITE_URL, CLOUDFLARE_ACCOUNT_HASH, TIDB_DATABASE_URL, ALGOLIA_*, etc.

Sugerencia para README (mini checklist al clonar)

Poner env vars (copiar .env.example).

Cambiar hero y pills en pages/index.tsx.

Editar Footer links en components/v2/Footer.tsx.

Revisar Header (items menú) en components/v2/Header.tsx.

Subir favicon y og-default.png a /public/.

Verificar NEXT_PUBLIC_SITE_URL y probar /sitemap.xml + /robots.txt.

Cargar CSV a TiDB (productos, CTAs, imágenes).

(Opcional) Añadir MDX por producto en TiDB o /content/products.




# OLDER VERSION UNTIL SEPTEMBER 19, 2025


# Bookshop Demo

Bookshop is a virtual online bookstore application through which you can find books of various categories and rate the books.

You can perform CRUD operations such as viewing book details, adding and deleting ratings, editing book inventory, etc.

> Powered by TiDB Cloud, Prisma and Vercel.

## 🔥 Visit Live Demo

[👉 Click here to visit](https://tidb-prisma-vercel-demo.vercel.app/)

![image](https://github.com/pingcap/tidb-prisma-vercel-demo/assets/56986964/2ef5fd7f-9023-45f4-b639-f4ba4ddec157)

## Deploy on Vercel

## 🧑‍🍳 Before We Start

Create a [TiDB Cloud](https://tidbcloud.com/) account and get your free trial cluster.

### 🚀 One Click Deploy

You can click the button to quickly deploy this demo if already has an TiDB Cloud cluster.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-title=TiDB%20Cloud%20Starter&demo-description=A%20bookstore%20demo%20built%20on%20TiDB%20Cloud%20and%20Next.js.&demo-url=https%3A%2F%2Ftidb-prisma-vercel-demo.vercel.app%2F&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F2HMASOQn8hQit2IFi2hK3j%2Fcfe7cc2aeba4b8f6760a3ea14c32f707%2Fscreenshot-20220902-160324_-_Chen_Zhen.png&project-name=TiDB%20Cloud%20Starter&repository-name=tidb-cloud-starter&repository-url=https%3A%2F%2Fgithub.com%2Fpingcap%2Ftidb-prisma-vercel-demo&from=templates&integration-ids=oac_coKBVWCXNjJnCEth1zzKoF1j)

> Integration will guide you connect your TiDB Cloud cluster to Vercel.

<details>
  <summary><h3>Manually Deploy (Not recommended)</h3></summary>

#### 1. Get connection details

You can get the connection details by clicking the `Connect` button.

![image](https://github.com/pingcap/tidb-prisma-vercel-demo/assets/56986964/86e5df8d-0d61-49ca-a1a8-d53f2a3f618c)

Get `User` and `Host` field from the dialog.

> Note: For importing initial data from local, you can set an Allow All traffic filter here by entering an IP address of `0.0.0.0/0`.

![image](https://github.com/pingcap/tidb-prisma-vercel-demo/assets/56986964/8d32ed58-4edb-412f-8af8-0e1303cceed9)

Your `DATABASE_URL` should look like `mysql://<User>:<Password>@<Host>:4000/bookshop`

#### 2. Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpingcap%2Ftidb-prisma-vercel-demo&repository-name=tidb-prisma-vercel-demo&env=DATABASE_URL&envDescription=TiDB%20Cloud%20connection%20string&envLink=https%3A%2F%2Fdocs.pingcap.com%2Ftidb%2Fdev%2Fdev-guide-build-cluster-in-cloud&project-name=tidb-prisma-vercel-demo)

![image](https://user-images.githubusercontent.com/56986964/199161016-2d236629-bb6a-4e3c-a700-c0876523ca6a.png)

</details>

## Deploy on AWS Linux

### Install git and nodejs pkgs

```bash
sudo yum install -y git

# Ref: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash;
source ~/.bashrc;
nvm install --lts;
node -e "console.log('Running Node.js ' + process.version)"
```

### Clone the repository

```bash
git clone https://github.com/pingcap/tidb-prisma-vercel-demo.git;
cd tidb-prisma-vercel-demo;
```

### Install dependencies

```bash
corepack enable;
corepack yarn install;
yarn;
```

### Connect to TiDB Cloud and create a database

```bash
mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 -u user -p
```

```
mysql> create database tidb_labs_bookshop;
```

### Set environment variables

```bash
export DATABASE_URL=mysql://user:pass@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/tidb_labs_bookshop
```

### Build the project

```bash
yarn run prisma:deploy && yarn run setup && yarn run build
```

### Start the server

```bash
yarn start
```

### Open the browser

Open the browser and visit `http://<ip>:3000`.

## 📖 Development Reference

### Prisma

[Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deploying-to-vercel)

### Bookshop Schema

[Bookshop Schema Design](https://docs.pingcap.com/tidbcloud/dev-guide-bookshop-schema-design)


