
# 📘 Catalog Architecture – Governance & SOP

This document explains the **architecture, naming conventions, and workflow** for our Catalog system.  
It is the **reference guide** for development, SEO, affiliate integration, and lead management.

---

## 1. Concept

The Catalog is the **core of SEO Armageddon**.  
- Every **Product** represents an opportunity to monetize:  
  - Affiliate item (Amazon, Capterra, SaaS tools, etc.)  
  - Lead Management offer (ice machines, forklifts for rent, etc.)  
  - Dropshipping item (real supplier inventory).  
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
