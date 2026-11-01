/* Python বই — service worker (scripts/make-sw.ts এটা থেকে public/sw.js বানায়; সরাসরি public/sw.js বদলিও না)
 *
 * install:  সব অধ্যায় + পাতা + ছবি + /_next/static-এর সব JS/CSS/font cache-এ রাখা (মোট ~৩ MB)
 * পাতা:     আগে network (৪ সেকেন্ড পর্যন্ত), না পেলে cache — তাই অনলাইনে সবসময় নতুন লেখা, অফলাইনে শেষ রাখা কপি
 * static:   cache-first (নামে hash থাকে, কখনো বদলায় না)
 * /api/*:   কখনো cache না — লক করা অনুশীলনী শুধু server থেকে আসে
 * Pyodide:  একবার কোড রানার চালালে cache হয়, পরে অফলাইনেও কোড চলে
 */
const VERSION = "__VERSION__";
const PAGES = __PAGES__;
const FILES = __FILES__;

const BOOK = "miu-book-" + VERSION;
const RUNTIME = "miu-runtime-v1";
const PYODIDE = "https://cdn.jsdelivr.net/pyodide/";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(BOOK);
    // পাতাগুলো একটা একটা করে — ধীর মোবাইল নেটেও যেন একসাথে ২০টা request না যায়
    for (const url of PAGES) {
      try {
        const res = await fetch(url, { cache: "reload", credentials: "same-origin" });
        if (!res.ok) continue;
        await cache.put(url, res);
      } catch { /* এই পাতা পরে পড়লে তখন cache হবে */ }
    }
    const list = FILES;
    for (let i = 0; i < list.length; i += 8) {
      await Promise.all(list.slice(i, i + 8).map(async (url) => {
        if (await cache.match(url)) return;
        try { const r = await fetch(url, { credentials: "same-origin" }); if (r.ok) await cache.put(url, r); } catch { /* ignore */ }
      }));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("miu-book-") && k !== BOOK).map((k) => caches.delete(k)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
    await self.clients.claim();
    const all = await self.clients.matchAll({ type: "window" });
    all.forEach((c) => c.postMessage({ type: "offline-ready", version: VERSION }));
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.href.startsWith(PYODIDE)) { event.respondWith(cacheFirst(req, RUNTIME)); return; }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  // Next-এর client navigation (RSC) — অফলাইনে fail হলে Next নিজেই পুরো পাতা খোলে, তখন নিচের navigate অংশ cache থেকে দেয়
  if (req.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (req.mode === "navigate") { event.respondWith(page(event)); return; }
  if (url.pathname.startsWith("/_next/image")) { event.respondWith(image(req, url)); return; }
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/img/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(req, BOOK));
    return;
  }
  event.respondWith(staleWhileRevalidate(req));
});

async function page(event) {
  const req = event.request;
  const url = new URL(req.url);
  const key = url.pathname.replace(/\/$/, "") || "/";
  const cache = await caches.open(BOOK);
  try {
    const res = await withTimeout((async () => (await event.preloadResponse) || fetch(req))(), 4000);
    if (res.ok && res.type === "basic" && !res.redirected) cache.put(key, res.clone());
    return res;
  } catch {
    const hit = (await cache.match(key)) || (await caches.match(key, { ignoreSearch: true }));
    if (hit) return hit;
    return offlinePage();
  }
}

// next/image ফোনের মাপ অনুযায়ী আলাদা width চায় — অফলাইনে সেটা না থাকলে আসল /img ফাইলটাই দেওয়া হয়
async function image(req, url) {
  const cache = await caches.open(BOOK);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const src = url.searchParams.get("url");
    const orig = src && (await cache.match(src));
    return orig || Response.error();
  }
}

async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(BOOK);
  const hit = await cache.match(req, { ignoreSearch: true });
  const net = fetch(req).then((res) => { if (res.ok && res.type === "basic") cache.put(req, res.clone()); return res; });
  if (hit) { net.catch(() => {}); return hit; }
  return net;
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

function offlinePage() {
  const html = `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>অফলাইন — Python বই</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#EDE7DB;color:#1B2230;font:18px/1.7 system-ui,sans-serif;text-align:center;padding:16px}@media (prefers-color-scheme:dark){body{background:#0C0D11;color:#E6E8EE}}a{color:#005CFF}</style></head>
<body><main><h1>ইন্টারনেট নেই</h1><p>এই পাতাটা এখনো অফলাইনের জন্য রাখা হয়নি।</p><p><a href="/">বইয়ের শুরুতে যাও</a></p></main></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
