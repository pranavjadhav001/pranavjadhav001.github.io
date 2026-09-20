# Coffee Beans Page — Live Notion-Backed Table + Static Story Content

## Context

The site currently links out to a public Notion page (`_includes/home-hero.html`) for coffee content. The user wants a dedicated page on the site itself (`/coffee/`) that:
1. Renders the "Coffee Beans" database as a native, searchable/filterable HTML/CSS table, live-synced from Notion (add a row in Notion → it shows up on the site, no rebuild).
2. Also surfaces the rest of the Notion page's content — "Coffee Equipment", "Humble Beginnings" (origin story), and "Coffees to Try" (wishlist) — which currently only exist on the Notion page.

I inspected the live Notion page via the Notion MCP connection and found:
- Page: `Coffee` (https://quill-leopon-2cd.notion.site/Coffee-59f8d8f2cfa14687af511c8e845f37d5)
- Inline database: **Coffee Beans**, database id `180f23826e388006abc9e12ac2d24fd8`, data source id `3ea563b7-762f-4163-82be-96d565d0ed49`
- 75 rows currently. Schema:
  | Property | Type | Notes |
  |---|---|---|
  | Coffee Name | title | primary label |
  | Company | text | roaster |
  | Origin Country | text | free text, inconsistent casing |
  | Roast | select | Light / Light-Medium / Medium / Medium-Dark / Dark / OmniRoast |
  | Process | select | ~30 options (washed, natural, anaerobic, etc.) |
  | Flavor Notes | multi_select | ~100 tag options |
  | Price per 250gm | number | often null |
  | Rating(/5) | number | often null |
  | Purchase Date | date | often null |
  | Microlot, Varietal, Recipe, Deductions | text/select | sparsely filled personal notes |
  | Looks | file | photo(s), Notion-hosted with **expiring signed URLs** |
- Three additional toggle-heading sections on the page, outside the database: **Coffee Equipment** (gear list w/ photos, prices, purchase links), **Humble Beginnings** (personal origin-story narrative w/ photos), **Coffees to Try** (a running wishlist of roasters/links).

Because this is a static GitHub Pages site with no backend, the Notion API secret cannot live in client-side JS. Decisions made with the user:

- **Coffee Beans table**: live serverless proxy. A Cloudflare Worker holds the Notion secret and is called by the page's JS on every visit, so the table is always current with no rebuild lag. Trade-off accepted: one small external service (Cloudflare, free tier) to maintain outside GitHub Pages.
- **Coffee Equipment / Humble Beginnings**: rarely change (a gear list and a personal story) → migrated **once** into the Jekyll page as static markdown/HTML, hand-edited in the repo from now on like any other page. No live sync, no extra worker complexity.
- **Coffees to Try**: user picked the same "static copy" treatment as the other two sections (not live-synced) — despite being the section most likely to get updated, the simplicity of one worker/one data source (just the beans table) won out over keeping this wishlist perpetually in sync. If this becomes annoying to hand-maintain later, it's the one section worth reconsidering for live sync.
- **Search/filter**: full client-side UX — since all 75 rows are fetched once and held in memory, no extra Notion calls are needed per interaction. Includes: text search (name/company/origin), dropdown filters for Roast and Process, clickable Flavor Note tag pills (Notion-style multi-select filtering), and click-to-sort column headers.

## Architecture

```
Browser (coffee.js on /coffee/)
   -> GET https://<worker>.workers.dev/coffee-beans   (CORS-restricted to the site's own origins)
        -> Cloudflare Worker
             - short edge cache (60s) via Cache API, to avoid hammering Notion on repeat visits
             - POST https://api.notion.com/v1/data_sources/3ea563b7-.../query
               (Authorization: Bearer <NOTION_TOKEN secret>, Notion-Version: 2025-09-03)
             - maps raw Notion property objects -> flat JSON array
   <- JSON array of all coffee rows (fetched once per page load)
   -> held in memory; search/filter/sort controls re-render the <table> from this in-memory array,
      no further network calls
```

No secrets ever reach the browser. New Notion rows appear on next page load (worst case ~60s stale due to the edge cache). The static narrative sections ship as part of the normal Jekyll build — no runtime fetch at all.

## Files to add/change

**New Jekyll page**
- `coffee.md` — front matter `layout: inner`, `permalink: /coffee/`, `title: Coffee`. Contains, top to bottom:
  1. Static markdown/HTML migrated from the Notion page's **Humble Beginnings** section (the origin story, with its photos copied into `img/` and referenced locally — Notion's signed image URLs expire, so these must be downloaded and committed, not hot-linked).
  2. Static markdown/HTML for **Coffee Equipment** (gear list: name, where bought, price, link) — also with images copied into `img/`.
  3. Static markdown/HTML for **Coffees to Try** (the wishlist of roasters/links).
  4. The search/filter controls + `#coffee-table-root` container for the live Coffee Beans table (rendered by JS below).
  - Sections 1–3 can reuse a simple accordion (Bootstrap 3's `data-toggle="collapse"`, already available via the theme) to mirror Notion's toggle-heading UX, or just render as plain sections — final call at implementation time based on how long the content reads.

**New client script**
- `js/coffee.js` — vanilla JS (matches existing `js/app.js` style, no framework/build step):
  - `fetch()`s the worker endpoint once on `DOMContentLoaded`, shows a loading state, then a friendly error message on failure (network/CORS/5xx)
  - keeps the full parsed array in memory as the single source of truth
  - **render**: one `<table>` with columns — photo thumbnail (`Looks`, first image if present), Coffee Name, Company, Origin Country, Roast, Process, Flavor Notes (small pill/badge tags), Rating(/5), Price per 250gm, Purchase Date — missing values render as `—`
  - **search**: text input filters rows by substring match on Coffee Name / Company / Origin Country
  - **filters**: `<select>` dropdowns for Roast and Process (options populated from the data actually present, not the full Notion option list); clicking a Flavor Note pill toggles it as an active filter (AND/OR semantics TBD at implementation — default to OR within the tag filter, AND against search/dropdowns)
  - **sort**: clicking a column header (Rating, Price, Purchase Date, Coffee Name) toggles ascending/descending; default sort is Purchase Date descending, nulls last
  - Microlot/Varietal/Recipe/Deductions stay out of the main table (sparse personal brewing notes); can add an expandable detail row later if wanted

**New styles**
- `_sass/_coffee.scss` — responsive table (`overflow-x: auto` wrapper for mobile), search/filter toolbar layout, active-filter pill styling, flavor-note pill styling consistent with the site's existing badge/button aesthetic, thumbnail sizing, and (if used) accordion styling for the static sections.
- Import it from `css/style.scss` alongside the existing `@import` lines.

**Config changes**
- `_config.yml`:
  - add `{ url: '/coffee/', text: 'Coffee' }` to `nav_item`
  - add `exclude: ["worker"]` so Jekyll doesn't try to publish the worker source alongside the site
- `_includes/home-hero.html`: change the `coffee @ home` link from the raw Notion URL to `/coffee/`.

**New Cloudflare Worker (separate deploy, code lives in-repo for version control)**
- `worker/index.js` — the Coffee Beans proxy described above. Key details:
  - `Notion-Version: 2025-09-03` header, data source id hardcoded as a constant (not secret)
  - `NOTION_TOKEN` read from Worker secret/env binding, never logged or echoed
  - `Access-Control-Allow-Origin` restricted to `https://www.pranavj.com`, `https://pranavjadhav001.github.io`, and `http://localhost:4000` (for local `jekyll serve` testing) — not `*`
  - Maps Notion's verbose property objects to a flat shape the client expects (e.g. `{ name, company, origin, roast, process, flavorNotes: [...], rating, pricePer250g, purchaseDate, photoUrl }`)
  - Scope is the Coffee Beans database only — no page-block fetching, per the static-content decision above.
- `worker/wrangler.toml` — Worker name, `main = "index.js"`, `compatibility_date`.

## Manual one-time setup (user-side, outside my access)

1. **Notion integration**: notion.so/my-integrations → New internal integration (e.g. "Personal Site Coffee Feed") → copy the secret.
2. **Share the database**: open the Coffee page in Notion → `•••` → Connections → add that integration, so it can read the Coffee Beans data source.
3. **Cloudflare**: free account → install Wrangler CLI → `wrangler login` (browser auth, must be done by the user) → `wrangler secret put NOTION_TOKEN` (paste the integration secret) → `wrangler deploy` from `worker/`. I can write and iterate on the worker code, but the login/secret/deploy steps need the user's own Cloudflare credentials.

## Verification

1. `bundle exec jekyll serve` locally, visit `/coffee/`, confirm:
   - the worker call succeeds (Network tab) and the table renders with real data, images, and tags
   - the migrated static sections (Equipment, Humble Beginnings, Coffees to Try) render correctly with local images
2. Exercise the search box, both dropdown filters, tag-pill filtering, and each sortable column header; confirm combinations compose correctly (e.g. search + Roast filter + tag filter together narrow results as expected) and an empty-result state is handled gracefully.
3. Add a throwaway test row in the Notion Coffee Beans database, reload `/coffee/` (allow up to ~60s for edge cache), confirm it appears in the table and is reachable via search/filters; delete the test row afterward.
4. Check responsive layout at mobile width (table should scroll horizontally, toolbar controls should wrap, not break page layout).
5. Confirm the worker rejects requests from other origins (e.g. `curl -H "Origin: https://evil.example"` should not get the CORS header) so the endpoint isn't casually scraped.
6. Confirm nav link and home-hero link both point at `/coffee/` and the old raw Notion link is gone from the homepage.

## Update (2026-09-20): the plan above is stale for photos — read this first

Everything above describes the *original* design. Since then, `js/coffee.js` grew a
second, separate photo mechanism that the sections above don't mention, and it's the
one that actually matters for what you see on the page:

- **Default "cards" view** (`currentView = "cards"`, CSS forces this everywhere) renders
  each bean's thumbnail from `pouchImage(bean.id)`, which looks the Notion page id up in
  a **hardcoded `POUCH_IMAGES` map at the top of `js/coffee.js`** and points at
  `img/coffee/3d/<file>.webp`. These are hand-picked "AI-rendered pouch photos", not
  auto-synced. Only beans present in this map get a thumbnail — everything else renders
  with no photo at all.
- `img/coffee/3d/mapping.md` is the living log of that map: which image file matches
  which ledger row, plus a running history of additions/edits.
- **`img/coffee/beans/`** (`scripts/sync-coffee-images.js`, described above) still exists
  and is still real, but it's now only a **fallback for the legacy table-row-expand code
  path** (`wireRowExpansion`), which the cards-view CSS may not even make reachable. Don't
  assume dropping a photo there does anything visible — it didn't, and cost a full
  extra debugging round trip to figure out (see git history around 2026-09-20,
  commits `ba45628` then the fix in `e11e105`).

### Runbook: adding a new bean (with photo) end to end

1. **Create the Notion row.** Use the Notion MCP tools against data source
   `collection://3ea563b7-762f-4163-82be-96d565d0ed49` (fetch it first for the current
   schema/options — `Process` and `Flavor Notes` are locked `select`/`multi_select` lists).
   - `Process` (single select, ~44 options as of 2026-09-20): if the value you want isn't
     an existing option, `notion-update-data-source` with `ALTER COLUMN "Process" SET
     SELECT(...)` can add it — but you must pass **every existing option verbatim with its
     color**, not just the new one, or you'll silently drop the others. Build the
     statement programmatically from a fresh schema fetch rather than hand-typing it.
   - `Flavor Notes` (multi-select) is **stuck at 124 options**, already over Notion's
     API-enforced cap of 100 for writes. You cannot add a new tag here via the API without
     first removing existing ones (untouched as of 2026-09-20, pending the site owner's
     review of what's safe to prune). Until then, put any flavor note that isn't an
     existing option into the `Deductions` text field instead of forcing a mismatch.
   - `Looks` (file property): do **not** set this in the same `notion-create-pages` call —
     passing a bare file-upload-id string there fails with `"File ... not found"`. Instead:
     1. `notion-create-file-upload` → get `file_upload_id` + `upload_url` + `upload_headers`.
     2. Immediately `curl -X POST <upload_url> -H "authorization: <upload_headers.authorization>" -F "file=@photo.png;type=image/png"`.
        Do this right away — the upload slot's authorization is short-lived.
     3. Create the page (properties only, no `Looks`, `content: ""`).
     4. `notion-update-page` on that page, `command: "update_properties"`, with
        `{"Looks": [{"type": "file_upload", "file_upload": {"id": "<file_upload_id>"}}]}`.
        This is the only shape that actually resolves — `notion-create-pages`'s plain
        string-array format for file properties doesn't work.
   - Note the new page's id (dashed UUID, e.g. `3e1f2382-6e38-81b9-83de-eb56c73c97d3`) —
     you need it for the next step.

2. **Prep the photo for `img/coffee/3d/`.** Existing pouch images are `.webp`, ~630-650px
   wide, ~50-100KB. Resize/convert with Pillow (or similar) to match, e.g.:
   ```python
   from PIL import Image
   im = Image.open(src).convert("RGB")
   w, h = im.size
   im = im.resize((640, int(h * 640 / w)), Image.LANCZOS)
   im.save(dst, "WEBP", quality=82)
   ```
   Name it `<coffee-name-slug>+<roaster-slug>.webp` (see `img/coffee/3d/mapping.md` for
   the exact convention, including the `-2`/`-3` suffix for duplicate renders).

3. **Wire it up in code:**
   - Add `"<notion-page-id>": "<filename>.webp"` to `POUCH_IMAGES` in `js/coffee.js`.
   - Add a row to the "Matched" table in `img/coffee/3d/mapping.md` (bump the count in
     its header too).

4. **Do not** also drop the photo in `img/coffee/beans/` — it's not read by the default
   view and just adds dead weight (see the stale-plan note above).

5. **Commit and push to `main`** (or a feature branch + PR, per whatever the site owner
   prefers that day) — GitHub Pages rebuilds automatically on push to `main`, no CI step
   needed. Give it a minute or two after pushing before checking the live site.

6. **Verify** on the live site (not just locally) — the bean *data* (name/roast/notes)
   comes from a live Notion fetch through the Cloudflare Worker and shows up immediately
   regardless of git state; only the *photo* depends on the `main` branch actually being
   deployed with the `img/coffee/3d/` file + `POUCH_IMAGES` entry.
