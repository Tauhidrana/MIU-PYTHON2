// GET /api/exercise?ch=N  (Authorization: Bearer <token>)  → {ch, blocks: Block[][]}
// লক করা অংশের আসল লেখা থাকে content/locked/chNN.json-এ (scripts/convert.ts বানায়) — public/-এর বাইরে, client bundle-এ কখনো না।
import fs from "node:fs";
import path from "node:path";
import { checkToken, secret, LOCKED_CHAPTERS } from "@/lib/unlock";
import { json } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try { secret(); } catch { return json(500, { error: "সার্ভারে আনলক চালু করা নেই। লেখককে জানাও।" }); }
  const ch = Number(new URL(req.url).searchParams.get("ch"));
  if (!LOCKED_CHAPTERS.includes(ch)) return json(404, { error: "এই অধ্যায়ে লক করা অংশ নেই" });
  const auth = req.headers.get("authorization") || "";
  if (!checkToken(auth.startsWith("Bearer ") ? auth.slice(7) : "")) return json(401, { error: "আনলক কোডের মেয়াদ নেই — কোডটা আবার দাও।" });
  const file = path.join(process.cwd(), "content", "locked", `ch${String(ch).padStart(2, "0")}.json`);
  let blocks: unknown;
  try { blocks = JSON.parse(fs.readFileSync(file, "utf8")); } catch { return json(500, { error: "অনুশীলনী পাওয়া যায়নি। পরে আবার চেষ্টা করো।" }); }
  return json(200, { ch, blocks }, { "Cache-Control": "private, no-store" });
}
