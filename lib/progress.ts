// পড়ার অগ্রগতি — localStorage-এ। পুরনো site-এর key ("last", "done") আর মান ("ch01.html") দুটোই মেনে নেয়,
// তাই নতুন site-এ এসেও পাঠক যেখানে থেমেছিল সেখান থেকে শুরু করতে পারে।
export type Last = { page: string; y?: number; frac?: number; bookPage?: number };

const norm = (p: string) => p.replace(/\.html$/, "");
function get<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } }
function put(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } }

export function readLast(): Last | null {
  const l = get<Last | null>("last", null);
  return l && l.page ? { ...l, page: norm(l.page) } : null;
}
export function saveLast(l: Last) { put("last", l); }
export function readDone(): string[] { return get<string[]>("done", []).map(norm); }
export function markDone(slug: string) {
  const d = readDone();
  if (!d.includes(slug)) put("done", [...d, slug]);
}
