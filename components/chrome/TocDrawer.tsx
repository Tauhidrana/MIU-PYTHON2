"use client";
// সূচিপত্র drawer — সব অধ্যায়, আর অধ্যায়ের পাতায় থাকলে সেই অধ্যায়ের section-গুলো।
// যেকোনো জায়গা থেকে "miu:toc" event পাঠালে খোলে (topbar, মোবাইলের নিচের মেনু, book mode-এর বাটন)।
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/types";
import { chapterUnit } from "@/lib/site";
import { Icon } from "./Icons";
import { readDone } from "@/lib/progress";

export type ChapterLink = { n: number; slug: string; short: string };
export const openToc = () => window.dispatchEvent(new Event("miu:toc"));

export function TocButton() {
  return (
    <button type="button" className="icon-btn" onClick={openToc} aria-label="সূচিপত্র খোলো" title="সূচিপত্র">
      <Icon name="toc" size={20} />
    </button>
  );
}

export function TocDrawer({ chapters, current, toc }: { chapters: ChapterLink[]; current?: number; toc?: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [sec, setSec] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const o = () => { opener.current = document.activeElement; setDone(readDone()); setOpen(true); };
    const s = (e: Event) => setSec((e as CustomEvent<string>).detail);
    window.addEventListener("miu:toc", o);
    window.addEventListener("miu:section", s);
    return () => { window.removeEventListener("miu:toc", o); window.removeEventListener("miu:section", s); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const p = panel.current;
    p?.querySelector<HTMLElement>("[aria-current]")?.scrollIntoView({ block: "center" });
    p?.querySelector<HTMLElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && p) { // focus drawer-এর ভেতরেই ঘোরে
        const f = p.querySelectorAll<HTMLElement>("a, button");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    document.documentElement.classList.add("no-scroll");
    return () => {
      document.removeEventListener("keydown", key);
      document.documentElement.classList.remove("no-scroll");
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  const close = () => setOpen(false);
  return (
    <div className={`drawer${open ? " show" : ""}`} hidden={!open}>
      <div className="drawer-backdrop" onClick={close} />
      <div className="drawer-panel paper" role="dialog" aria-modal="true" aria-label="সূচিপত্র" ref={panel}>
        <div className="drawer-head">
          <strong>সূচিপত্র</strong>
          <button type="button" className="icon-btn" onClick={close} aria-label="বন্ধ করো"><Icon name="close" size={20} /></button>
        </div>
        <div className="drawer-body">
          {toc && toc.length > 0 && (
            <>
              <p className="drawer-h">এই অধ্যায়ে</p>
              <ol className="drawer-sec">
                {toc.map((t) => (
                  <li key={t.sid}>
                    <a href={`#${t.sid}`} onClick={(e) => { close(); window.dispatchEvent(new CustomEvent("miu:goto", { detail: t.sid })); if (document.documentElement.dataset.mode === "book") e.preventDefault(); }}
                      aria-current={sec === t.sid ? "location" : undefined}>{t.text}</a>
                  </li>
                ))}
              </ol>
            </>
          )}
          <p className="drawer-h">সব অধ্যায়</p>
          <ol className="drawer-ch">
            {chapters.map((c) => (
              <li key={c.n}>
                <Link href={`/chapters/${c.slug}`} onClick={close} aria-current={c.n === current ? "page" : undefined} className={done.includes(c.slug) ? "done" : undefined}>
                  <span className="u">{chapterUnit(c.n)}</span>{c.short}
                </Link>
              </li>
            ))}
          </ol>
          <p className="drawer-h">আরও</p>
          <ul className="drawer-more">
            <li><Link href="/runner" onClick={close}>কোড রানার</Link></li>
            <li><Link href="/feedback" onClick={close}>রিভিউ ও মতামত</Link></li>
            <li><Link href="/pdf" onClick={close}>বইয়ের PDF</Link></li>
            <li><Link href="/copyright" onClick={close}>কপিরাইট নোটিশ</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
