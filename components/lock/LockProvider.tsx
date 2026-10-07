"use client";
// অনুশীলনী ও বোর্ড প্রশ্নের লক — PDF-এর সাথে পাওয়া আনলক কোড দিয়ে খোলে।
// কোড দিলে /api/unlock একটা token দেয়; সেই token দেখিয়ে /api/exercise থেকে এই অধ্যায়ের লক করা block-গুলো আসে।
// token এই browser-এ থাকে (key "unlock-token" — পুরনো site-এর সাথে একই), তাই reload-এ বা অন্য অধ্যায়ে আবার কোড দিতে হয় না।
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Block, LockedResponse } from "@/lib/types";

const KEY = "unlock-token";
type State = "idle" | "loading" | "open";
type Ctx = {
  state: State;
  groups: Block[][] | null;
  status: { cls: "" | "err"; msg: string };
  submit(code: string): Promise<void>;
};
const LockCtx = createContext<Ctx | null>(null);
export const useLock = () => useContext(LockCtx);

export function getToken() { try { return localStorage.getItem(KEY); } catch { return null; } }
function setToken(t: string | null) { try { if (t) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY); } catch { /* private mode */ } }

// token-এর payload-এ buyerId থাকে ({"b": "rahim01", "e": মেয়াদ}) — watermark-এর জন্য; যাচাই হয় server-এ
export function buyerFromToken(t: string | null): string | null {
  try {
    const p = JSON.parse(atob(String(t).split(".")[0].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof p.b === "string" && p.e > Date.now() / 1000 ? p.b : null;
  } catch { return null; }
}

type Err = { auth?: boolean; msg?: string };
const NET = "সার্ভারে পৌঁছানো যাচ্ছে না। Internet সংযোগ দেখে আবার চেষ্টা করো।";

export function LockProvider({ ch, hasLocked, children }: { ch: number; hasLocked: boolean; children: React.ReactNode }) {
  const [state, setState] = useState<State>("idle");
  const [groups, setGroups] = useState<Block[][] | null>(null);
  const [status, setStatus] = useState<Ctx["status"]>({ cls: "", msg: "" });

  const openAll = useCallback(async (token: string) => {
    const r = await fetch(`/api/exercise?ch=${ch}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (r.status === 401) throw { auth: true } as Err;
    if (!r.ok) throw { msg: "অনুশীলনী লোড করা যায়নি। একটু পরে পাতাটা আবার খোলো।" } as Err;
    const d: LockedResponse = await r.json();
    setGroups(d.blocks);
    setState("open");
    setStatus({ cls: "", msg: "" });
    window.dispatchEvent(new CustomEvent("miu:unlocked", { detail: { ch } }));
    if (location.hash === "#unlock") history.replaceState(null, "", location.pathname + location.search);
  }, [ch]);

  useEffect(() => {
    if (!hasLocked) return;
    const saved = getToken();
    if (!saved) return;
    setState("loading");
    setStatus({ cls: "", msg: "অনুশীলনী খোলা হচ্ছে…" });
    openAll(saved).catch((e: Err) => {
      setState("idle");
      if (e?.auth) { setToken(null); setStatus({ cls: "err", msg: "আগের আনলকের মেয়াদ শেষ — কোডটা আবার দাও।" }); }
      else setStatus({ cls: "err", msg: e?.msg || NET });
    });
  }, [hasLocked, openAll]);

  const submit = useCallback(async (code: string) => {
    setState("loading");
    setStatus({ cls: "", msg: "যাচাই হচ্ছে…" });
    try {
      const r = await fetch("/api/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 429) throw { msg: d.error || "অনেকবার চেষ্টা হয়েছে। এক মিনিট পরে আবার চেষ্টা করো।" } as Err;
      if (!r.ok || !d.token) throw { msg: r.status === 401 || r.status === 400 ? "কোডটা সঠিক নয়। আবার দেখে লেখো।" : d.error || "সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করো।" } as Err;
      setToken(d.token);
      await openAll(d.token);
    } catch (e) {
      setState("idle");
      setStatus({ cls: "err", msg: (e as Err)?.msg || NET });
      throw e;
    }
  }, [openAll]);

  const value = useMemo(() => ({ state, groups, status, submit }), [state, groups, status, submit]);
  return <LockCtx.Provider value={value}>{children}</LockCtx.Provider>;
}
