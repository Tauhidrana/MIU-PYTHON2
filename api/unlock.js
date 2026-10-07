// POST /api/unlock  {code}  → কোড ঠিক হলে {token}
const { checkCode, makeToken, rateLimited, clientIp, send, readJson, secret } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "শুধু POST চলবে" }, { Allow: "POST" });
  try { secret(); } catch (e) { return send(res, 500, { error: "সার্ভারে আনলক চালু করা নেই। লেখককে জানাও।" }); }
  if (rateLimited(clientIp(req))) return send(res, 429, { error: "অনেকবার চেষ্টা হয়েছে। এক মিনিট পরে আবার চেষ্টা করো।" }, { "Retry-After": "60" });
  let body;
  try { body = await readJson(req); } catch (e) { return send(res, 400, { error: "কোডটা সঠিক নয়। আবার দেখে লেখো।" }); }
  const buyerId = checkCode(body && body.code);
  if (!buyerId) return send(res, 401, { error: "কোডটা সঠিক নয়। আবার দেখে লেখো।" });
  send(res, 200, { token: makeToken(buyerId) });
};
