// next build-এর পরে চলে, public/sw.js বানায়: VERSION = Next-এর BUILD_ID, তাই প্রতিটা deploy-এ পুরনো cache মুছে
// নতুন বই অফলাইনে রাখা হয়। .next/static-এর সব JS/CSS/font (~১ MB) তালিকায় যায় — lazy chunk আর font subset-ও,
// যেগুলো HTML-এ লেখা থাকে না। /api/* (লক করা অনুশীলনী) কখনো cache হয় না।
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const chapters = Array.from({ length: 12 }, (_, i) => `/chapters/ch${String(i + 1).padStart(2, "0")}`);
const pages = ["/", ...chapters, "/runner", "/feedback", "/pdf", "/copyright"];
const images = fs.readdirSync(path.join(PUBLIC, "img")).filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f)).map((f) => `/img/${f}`);
const extras = ["/manifest.webmanifest", "/py-worker.js", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];

const NEXT = path.join(ROOT, ".next");
const version = fs.readFileSync(path.join(NEXT, "BUILD_ID"), "utf8").trim();
const statics = (fs.readdirSync(path.join(NEXT, "static"), { recursive: true }) as string[])
  .filter((f) => fs.statSync(path.join(NEXT, "static", f)).isFile() && !f.endsWith(".map"))
  .map((f) => `/_next/static/${f.split(path.sep).join("/")}`);
const template = fs.readFileSync(path.join(__dirname, "sw.template.js"), "utf8");
const out = template
  .replace("__VERSION__", version)
  .replace("__PAGES__", JSON.stringify(pages))
  .replace("__FILES__", JSON.stringify([...images, ...extras, ...statics]));

fs.writeFileSync(path.join(PUBLIC, "sw.js"), out);
console.log(`sw.js: version ${version}, ${pages.length} পাতা, ${images.length + extras.length + statics.length} ফাইল`);
