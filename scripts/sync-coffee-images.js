#!/usr/bin/env node
// Manual sync: downloads coffee bean photos from Notion into img/coffee/beans/
// so the site can serve them as static files instead of relying on Notion's
// temporary signed URLs. Run this whenever you add/replace a bean photo:
//
//   NOTION_TOKEN=ntn_xxx node scripts/sync-coffee-images.js
//
// or drop the token in a git-ignored .notion-token file in the repo root.
//
// Idempotent: skips beans that already have a synced image. Pass --force to
// re-download everything.

const fs = require("fs");
const path = require("path");

const DATA_SOURCE_ID = "3ea563b7-762f-4163-82be-96d565d0ed49";
const NOTION_VERSION = "2025-09-03";
const OUTPUT_DIR = path.join(__dirname, "..", "img", "coffee", "beans");
const FORCE = process.argv.includes("--force");

const EXT_BY_CONTENT_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function getToken() {
  if (process.env.NOTION_TOKEN) return process.env.NOTION_TOKEN.trim();
  const tokenFile = path.join(__dirname, "..", ".notion-token");
  if (fs.existsSync(tokenFile)) return fs.readFileSync(tokenFile, "utf8").trim();
  console.error(
    "No Notion token found. Set NOTION_TOKEN env var, or put the token in a .notion-token file in the repo root (git-ignored)."
  );
  process.exit(1);
}

async function fetchAllBeans(token) {
  const rows = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Notion API error: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    for (const page of data.results) {
      rows.push({ id: page.id, photoUrl: getFileUrl(page.properties["Looks"]) });
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return rows;
}

function getFileUrl(prop) {
  const file = prop && prop.files && prop.files[0];
  if (!file) return null;
  return file.type === "external" ? file.external && file.external.url : file.file && file.file.url;
}

function existingSyncedFile(id) {
  if (!fs.existsSync(OUTPUT_DIR)) return null;
  const match = fs.readdirSync(OUTPUT_DIR).find((f) => f.startsWith(id + "."));
  return match || null;
}

async function downloadImage(id, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const contentType = res.headers.get("content-type") || "";
  const ext = EXT_BY_CONTENT_TYPE[contentType.split(";")[0].trim()] || "jpg";
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, `${id}.${ext}`), buffer);
  return `${id}.${ext}`;
}

async function main() {
  const token = getToken();
  console.log("Fetching coffee beans from Notion...");
  const beans = await fetchAllBeans(token);
  const withPhotos = beans.filter((b) => b.photoUrl);
  console.log(`${beans.length} beans total, ${withPhotos.length} with a photo.`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const bean of withPhotos) {
    const existing = existingSyncedFile(bean.id);
    if (existing && !FORCE) {
      skipped++;
      continue;
    }
    try {
      const filename = await downloadImage(bean.id, bean.photoUrl);
      console.log(`  synced ${bean.id} -> ${filename}`);
      downloaded++;
    } catch (err) {
      console.error(`  FAILED ${bean.id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Downloaded ${downloaded}, skipped ${skipped} (already synced), failed ${failed}.`);
  if (downloaded > 0) {
    console.log("Don't forget to git add/commit img/coffee/beans/.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
