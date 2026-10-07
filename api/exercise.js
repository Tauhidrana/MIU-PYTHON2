// GET /api/exercise?ch=N  (Authorization: Bearer <token>)  → {ch, blocks: [html, ...]}
// অনুশীলনীর আসল লেখা থাকে content/locked/chNN.json-এ (tools/build_site.py বানায়) — site/-এর বাইরে, তাই সরাসরি URL দিয়ে পাওয়া যায় না।
const fs = require("fs");
const path = require("path");
const { checkToken, send, secret, LOCKED_CHAPTERS } = require("./_lib");

module.exports = (req, res) => {
  if (req.method !== "GET") return send(res, 405, { error: "শুধু GET চলবে" }, { Allow: "GET" });
  try { secret(); } catch (e) { return send(res, 500, { error: "সার্ভারে আনলক চালু করা নেই। লেখককে জানাও।" }); }
  const ch = Number(new URL(req.url, "http://x").searchParams.get("ch"));
  if (!LOCKED_CHAPTERS.includes(ch)) return send(res, 404, { error: "এই অধ্যায়ে লক করা অংশ নেই" });
  const auth = String(req.headers.authorization || "");
  if (!checkToken(auth.startsWith("Bearer ") ? auth.slice(7) : "")) return send(res, 401, { error: "আনলক কোডের মেয়াদ নেই — কোডটা আবার দাও।" });
  const file = path.join(process.cwd(), "content", "locked", `ch${String(ch).padStart(2, "0")}.json`);
  let blocks;
  try { blocks = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return send(res, 500, { error: "অনুশীলনী পাওয়া যায়নি। পরে আবার চেষ্টা করো।" }); }
  send(res, 200, { ch, blocks }, { "Cache-Control": "private, no-store" });
};
