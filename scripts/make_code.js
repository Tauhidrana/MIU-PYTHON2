#!/usr/bin/env node
// ক্রেতার জন্য আনলক কোড বানাও:   node scripts/make_code.js <buyerId> [<buyerId> ...]
// UNLOCK_SECRET নেয় env থেকে, না থাকলে tools/private/unlock_secret.txt থেকে (gitignored)।
// Vercel-এ যে UNLOCK_SECRET দেওয়া আছে, এখানেও ঠিক সেটাই হতে হবে — না হলে কোড মিলবে না।
const fs = require("fs");
const path = require("path");

if (!process.env.UNLOCK_SECRET) {
  const f = path.join(__dirname, "..", "tools", "private", "unlock_secret.txt");
  if (fs.existsSync(f)) process.env.UNLOCK_SECRET = fs.readFileSync(f, "utf8").trim();
}
const { makeCode } = require("../api/_lib");

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error("ব্যবহার: node scripts/make_code.js <buyerId>   (যেমন: rahim01 — শুধু a-z, 0-9, _)");
  process.exit(1);
}
try {
  for (const id of ids) console.log(makeCode(id));
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
