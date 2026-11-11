import assert from "node:assert/strict";
import { test } from "node:test";

const origin = (process.env.SEO_TEST_ORIGIN ?? "http://127.0.0.1:4173").replace(/\/$/, "");
const canonicalOrigin = (process.env.SEO_CANONICAL_ORIGIN ?? "https://pc-anatomy.brickshow.site").replace(/\/$/, "");
const componentSlugs = [
  "pc-case",
  "cpu",
  "motherboard",
  "ram",
  "gpu",
  "ssd",
  "m2-ssd",
  "hdd",
  "power-supply",
  "cpu-cooler",
  "case-fans",
  "keyboard",
  "mouse",
  "monitor",
  "ups",
  "avr",
];
const indexablePaths = [
  "/",
  "/explore",
  "/assembly",
  "/components/storage",
  ...componentSlugs.map((slug) => `/components/${slug}`),
];

async function get(path) {
  return fetch(`${origin}${path}`, { redirect: "follow" });
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<meta[^>]+name="${escaped}"[^>]+content="([^"]*)"`, "i"))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+property="${escaped}"[^>]+content="([^"]*)"`, "i"))?.[1]
    ?? "";
}

function canonical(html) {
  return html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] ?? "";
}

function textContent(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

test("robots allows educational pages and points at the production sitemap", async () => {
  const response = await get("/robots.txt");
  assert.equal(response.status, 200);
  const robots = await response.text();
  assert.match(robots, /User-Agent:\s*\*/i);
  assert.match(robots, /Allow:\s*\//i);
  assert.match(robots, /Disallow:\s*\/api\//i);
  assert.match(robots, new RegExp(`Sitemap:\\s*${canonicalOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml`, "i"));
  assert.doesNotMatch(robots, /Disallow:\s*\/components/i);
});

test("sitemap contains only the canonical public learning routes", async () => {
  const response = await get("/sitemap.xml");
  assert.equal(response.status, 200);
  const xml = await response.text();
  assert.match(response.headers.get("content-type") ?? "", /xml/i);
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const expected = indexablePaths.map((path) => `${canonicalOrigin}${path === "/" ? "/" : path}`).sort();
  assert.deepEqual(urls.sort(), expected);
  assert.equal(new Set(urls).size, urls.length, "sitemap URLs must be unique");
  assert.ok(urls.every((url) => !/[?&#]/.test(url)), "sitemap must not contain query or fragment URLs");
});

test("all sitemap pages are indexable, canonical, and have useful server-rendered content", async () => {
  const results = await Promise.all(indexablePaths.map(async (path) => {
    const response = await get(path);
    const html = await response.text();
    assert.equal(response.status, 200, `${path} should return HTTP 200`);
    assert.match(meta(html, "robots"), /index/i, `${path} should be indexable`);
    assert.doesNotMatch(meta(html, "robots"), /noindex/i, `${path} must not contain noindex`);
    assert.ok(meta(html, "description").length > 40, `${path} needs a useful meta description`);
    assert.ok(meta(html, "description").length <= 170, `${path} meta description should be concise`);
    assert.match(html, /<title>[^<]+<\/title>/i, `${path} needs a title`);
    const canonicalUrl = new URL(canonical(html));
    const expectedCanonical = new URL(path, canonicalOrigin);
    assert.equal(canonicalUrl.origin, expectedCanonical.origin, `${path} canonical host should match the site`);
    assert.equal(canonicalUrl.pathname.replace(/\/$/, "") || "/", expectedCanonical.pathname.replace(/\/$/, "") || "/", `${path} should self-canonicalize`);
    assert.equal(canonicalUrl.search, "", `${path} canonical must not contain query parameters`);
    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${path} should have exactly one H1`);
    assert.ok(textContent(html).length > 300, `${path} should expose meaningful text without JavaScript`);
    assert.ok(meta(html, "og:title"), `${path} needs Open Graph title`);
    assert.ok(meta(html, "twitter:card"), `${path} needs Twitter card metadata`);
    return { path, html };
  }));

  const explore = results.find(({ path }) => path === "/explore").html;
  for (const path of indexablePaths.filter((url) => url.startsWith("/components/"))) {
    assert.ok(explore.includes(`href="${path}"`), `/explore should link to ${path}`);
  }
  const titles = results.map(({ html }) => html.match(/<title>([^<]+)<\/title>/i)?.[1]);
  const descriptions = results.map(({ html }) => meta(html, "description"));
  assert.equal(new Set(titles).size, titles.length, "indexable pages need unique titles");
  assert.equal(new Set(descriptions).size, descriptions.length, "indexable pages need unique descriptions");
});

test("component guides expose parseable article, FAQ, and breadcrumb JSON-LD", async () => {
  for (const path of indexablePaths.filter((url) => url.startsWith("/components/"))) {
    const response = await get(path);
    const html = await response.text();
    const blocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
      .map((match) => JSON.parse(match[1]));
    const entities = blocks.flatMap((block) => Array.isArray(block) ? block : [block]);
    assert.ok(entities.some((entity) => ["Article", "TechArticle"].includes(entity["@type"])), `${path} needs article schema`);
    assert.ok(entities.some((entity) => entity["@type"] === "FAQPage"), `${path} needs matching FAQ schema`);
    const breadcrumb = entities.find((entity) => entity["@type"] === "BreadcrumbList");
    assert.ok(breadcrumb, `${path} needs breadcrumb schema`);
    assert.ok(breadcrumb.itemListElement.at(-1)?.item, `${path} breadcrumb needs its canonical item URL`);
  }
});

test("internal links found in indexable pages resolve to a successful page or redirect", async () => {
  const pages = await Promise.all(indexablePaths.map(async (path) => ({ path, html: await (await get(path)).text() })));
  const links = new Set();
  for (const { html } of pages) {
    for (const [, rawHref] of html.matchAll(/\shref="([^"]+)"/gi)) {
      const href = rawHref.replace(/&amp;/g, "&");
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const url = new URL(href, origin);
      if (url.origin === origin) links.add(`${url.pathname}${url.search}`);
    }
  }

  const failures = [];
  await Promise.all([...links].map(async (path) => {
    const response = await get(path);
    if (!response.ok) failures.push(`${path} returned ${response.status}`);
  }));
  assert.deepEqual(failures, []);
});
