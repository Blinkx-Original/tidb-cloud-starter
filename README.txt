
TiDB → Algolia Sync — COMPLETE PACK (No‑terminal) 
=================================================

This pack includes:
• Admin UI for Connections → Profiles → Field Mapping → Sync
• Protected APIs (token) and a Vercel Cron endpoint (no token, header-gated)
• GitHub Action workflow (parameterized)
• Example Vercel crons file
• TLS/SSL enforced for TiDB with optional CA path

Folder to drop at repo root. After commit, open /admin/tidb-mapping.

---
One-time SQL (create profiles table in TiDB)
-------------------------------------------
Run once on your TiDB database (any SQL client):

CREATE TABLE IF NOT EXISTS sync_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  profile_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  table_name VARCHAR(200) NOT NULL,
  primary_key VARCHAR(100) NOT NULL,
  updated_at_col VARCHAR(100) NULL,
  sql_filter TEXT NULL,
  algolia_index VARCHAR(200) NOT NULL,
  object_id_prefix VARCHAR(50) NULL,
  url_template VARCHAR(300) NULL, -- e.g. /product/{{slug}} or /{{category_slug}}/{{slug}}
  mappings_json JSON NOT NULL,    -- array of {column, attr, include, jsonArray}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

If you prefer zero SQL, tell me and I’ll add /api/tidb-sync/profile/init to create it.

---
Environment variables expected
------------------------------
# TiDB
TIDB_HOST=
TIDB_PORT=4000
TIDB_USER=
TIDB_PASSWORD=
TIDB_DB=              # or TIDB_DATABASE
TIDB_SSL_CA_PATH=     # optional PEM path, if your TiDB needs a custom CA

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=
ALGOLIA_ADMIN_KEY=
NEXT_PUBLIC_ALGOLIA_INDEX_PREFIX=   # optional index prefix

# Admin
INDEX_ADMIN_TOKEN=   # used by protected endpoints and /admin screens

---
How to use (no terminal)
------------------------
1) Upload this whole folder into your repo root and commit.
2) Open /admin/tidb-mapping
   - Paste your INDEX_ADMIN_TOKEN
   - New Profile → set profile_key, table_name, primary_key, algolia_index, url_template
   - Fetch columns → build Field Mapping (column → Algolia attr) and Save
   - Preview JSON → Run Full Reindex
3) Your search now finds items and clicks go to url_template result.

---
Automation
----------
• Vercel Cron:
  - Add entries from vercel.crons.example.json to your vercel.json and set ?profile=... in the path.
  - Vercel will call /api/tidb-sync/run-cron with x-vercel-cron header (no token required).

• GitHub Actions:
  - Add Actions secret: INDEX_ADMIN_TOKEN
  - Add Actions variables: SYNC_ENDPOINT (https://your-domain/api/tidb-sync/run), PROFILE_KEY, CHUNK_SIZE=500, CLEAR=false
  - The workflow runs hourly and can be triggered manually with profile input.

---
SSL/TLS
-------
Both DB helpers enforce TLS 1.2 and rejectUnauthorized. If your TiDB requires a specific CA, upload the PEM and set TIDB_SSL_CA_PATH to its runtime path.
