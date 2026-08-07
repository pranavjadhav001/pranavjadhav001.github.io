const DATA_SOURCE_ID = "3ea563b7-762f-4163-82be-96d565d0ed49";
const NOTION_VERSION = "2025-09-03";
const CACHE_TTL_SECONDS = 60;
const ALLOWED_ORIGINS = new Set([
  "https://www.pranavj.com",
  "https://pranavjadhav001.github.io",
  "http://localhost:4000",
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = buildCorsHeaders(request.headers.get("Origin"));

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "GET" || url.pathname !== "/coffee-beans") {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (!response) {
      try {
        const beans = await fetchAllCoffeeBeans(env.NOTION_TOKEN);
        response = new Response(JSON.stringify(beans), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
          },
        });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch coffee data", detail: err.message }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    const finalHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders)) {
      finalHeaders.set(key, value);
    }
    return new Response(response.body, { status: response.status, headers: finalHeaders });
  },
};

function buildCorsHeaders(origin) {
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Vary": "Origin",
    };
  }
  return {};
}

async function fetchAllCoffeeBeans(token) {
  const rows = [];
  let cursor;

  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    for (const page of data.results) {
      rows.push(mapPageToCoffeeBean(page));
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return rows;
}

function mapPageToCoffeeBean(page) {
  const props = page.properties;
  return {
    id: page.id,
    name: getTitle(props["Coffee Name"]),
    company: getRichText(props["Company"]),
    origin: getRichText(props["Origin Country"]),
    roast: getSelect(props["Roast"]),
    process: getSelect(props["Process"]),
    varietal: getRichText(props["Varietal"]),
    flavorNotes: getMultiSelect(props["Flavor Notes"]),
    rating: getNumber(props["Rating(/5)"]),
    pricePer250g: getNumber(props["Price per 250gm"]),
    purchaseDate: getDate(props["Purchase Date"]),
    photoUrl: getFileUrl(props["Looks"]),
  };
}

function getTitle(prop) {
  const text = prop?.title?.map((t) => t.plain_text).join("");
  return text || null;
}

function getRichText(prop) {
  const text = prop?.rich_text?.map((t) => t.plain_text).join("");
  return text || null;
}

function getSelect(prop) {
  return prop?.select?.name || null;
}

function getMultiSelect(prop) {
  return prop?.multi_select?.map((o) => o.name) || [];
}

function getNumber(prop) {
  return typeof prop?.number === "number" ? prop.number : null;
}

function getDate(prop) {
  return prop?.date?.start || null;
}

function getFileUrl(prop) {
  const file = prop?.files?.[0];
  if (!file) return null;
  return file.type === "external" ? file.external?.url ?? null : file.file?.url ?? null;
}
