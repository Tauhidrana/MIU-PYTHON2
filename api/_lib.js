// আনলক কোড ও token-এর হিসাব — api/unlock.js, api/exercise.js আর scripts/make_code.js একই নিয়ম ব্যবহার করে।
// "_" দিয়ে শুরু, তাই Vercel এটাকে আলাদা function বানায় না।
//
// কোড:  <buyerId>-<HMAC(UNLOCK_SECRET, buyerId)-এর প্রথম ৪০ bit, Crockford base32-এ ৮ অক্ষর>   যেমন rahim01-7KQ2M9XA
// token: <payload>.<HMAC(UNLOCK_SECRET, "token." + payload)>   payload = base64url({"b": buyerId, "e": মেয়াদ})
// Database লাগে না — secret জানলেই যেকোনো কোড আর token যাচাই করা যায়, secret থাকে শুধু env var-এ।
const crypto = require("crypto");

const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";      // Crockford base32: I, L, O, U নেই — পড়তে ভুল কম হয়
const BUYER_RE = /^[a-z0-9_]{1,32}$/;
const TOKEN_DAYS = 365;
const LOCKED_CHAPTERS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];   // tools/build_site.py-এর FREE_CHAPTERS বাদে সব

function secret() {
  const s = process.env.UNLOCK_SECRET || "";
  if (s.length < 16) throw new Error("UNLOCK_SECRET env var নেই বা ১৬ অক্ষরের কম");
  return s;
}
const hmac = (msg) => crypto.createHmac("sha256", secret()).update(msg).digest();

function base32(buf, n) {
  let bits = 0, val = 0, out = "";
  for (const b of buf) {
    val = (val << 8) | b; bits += 8;
    while (bits >= 5 && out.length < n) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
    if (out.length >= n) break;
  }
  return out;
}
const codeSig = (buyerId) => base32(hmac(buyerId), 8);

function makeCode(buyerId) {
  buyerId = String(buyerId).trim().toLowerCase();
  if (!BUYER_RE.test(buyerId)) throw new Error("buyerId-এ শুধু a-z, 0-9 আর _ চলবে (সর্বোচ্চ ৩২ অক্ষর)");
  return buyerId + "-" + codeSig(buyerId);
}

// ঠিক কোড হলে buyerId, না হলে null। বাংলা অঙ্ক, ছোট/বড় হাতের অক্ষর, ফাঁকা জায়গা — সব মেনে নেয়।
function checkCode(input) {
  const s = String(input || "").replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d)).replace(/\s+/g, "");
  const i = s.lastIndexOf("-");
  if (i < 1) return null;
  const buyerId = s.slice(0, i).toLowerCase();
  const sig = s.slice(i + 1).toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1");
  if (!BUYER_RE.test(buyerId) || !/^[0-9A-Z]{8}$/.test(sig)) return null;
  const want = Buffer.from(codeSig(buyerId)), got = Buffer.from(sig);
  return crypto.timingSafeEqual(want, got) ? buyerId : null;
}

const b64u = (buf) => Buffer.from(buf).toString("base64url");
function makeToken(buyerId) {
  const payload = b64u(JSON.stringify({ b: buyerId, e: Math.floor(Date.now() / 1000) + TOKEN_DAYS * 86400 }));
  return payload + "." + b64u(hmac("token." + payload));
}
function checkToken(token) {
  const [payload, sig, extra] = String(token || "").split(".");
  if (!payload || !sig || extra !== undefined) return null;
  const want = Buffer.from(b64u(hmac("token." + payload))), got = Buffer.from(sig);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, "base64url").toString());
    return p.e > Date.now() / 1000 && BUYER_RE.test(p.b) ? p.b : null;
  } catch (e) { return null; }
}

// প্রতি IP-তে প্রতি মিনিটে সর্বোচ্চ ৫ বার চেষ্টা। Database নেই বলে হিসাবটা function-এর memory-তে থাকে —
// একই instance-এ আসা request-গুলো আটকায়; Vercel নতুন instance চালু করলে সেখানে হিসাব নতুন করে শুরু হয়।
const hits = new Map();
function rateLimited(ip, limit = 5, windowMs = 60000) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] >= windowMs) hits.delete(k);
  return list.length > limit;
}
function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.headers["x-real-ip"] || (req.socket && req.socket.remoteAddress) || "?";
}

function send(res, status, data, extra) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const k in extra || {}) res.setHeader(k, extra[k]);
  res.end(JSON.stringify(data));
}
async function readJson(req) {
  if (req.body !== undefined) return typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  let raw = "";
  for await (const c of req) { raw += c; if (raw.length > 2000) throw new Error("too big"); }
  return JSON.parse(raw || "{}");
}

module.exports = { makeCode, checkCode, makeToken, checkToken, rateLimited, clientIp, send, readJson, secret, LOCKED_CHAPTERS };
