// POST /api/unlock  {code}  → কোড ঠিক হলে {token}   (আগের api/unlock.js-এর মতোই)
import { checkCode, makeToken, rateLimited, secret } from "@/lib/unlock";
import { clientIp, json } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WRONG = "কোডটা সঠিক নয়। আবার দেখে লেখো।";

export async function POST(req: Request) {
  try { secret(); } catch { return json(500, { error: "সার্ভারে আনলক চালু করা নেই। লেখককে জানাও।" }); }
  if (rateLimited(clientIp(req))) return json(429, { error: "অনেকবার চেষ্টা হয়েছে। এক মিনিট পরে আবার চেষ্টা করো।" }, { "Retry-After": "60" });
  let body: { code?: unknown };
  try {
    const raw = await req.text();
    if (raw.length > 2000) throw new Error("too big");
    body = JSON.parse(raw || "{}");
  } catch { return json(400, { error: WRONG }); }
  const buyerId = checkCode(body && body.code);
  if (!buyerId) return json(401, { error: WRONG });
  return json(200, { token: makeToken(buyerId) });
}
