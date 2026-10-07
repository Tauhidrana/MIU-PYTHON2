"use client";
// বড় পর্দায় দুই পাশের তালিকা: বামে সব অধ্যায় (শেষ করা গুলোয় ✓), ডানে এই অধ্যায়ের section (যেটা পড়া হচ্ছে চিহ্নিত)
import Link from "next/link";
import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/types";
import type { ChapterLink } from "@/components/chrome/TocDrawer";
import { chapterUnit } from "@/lib/site";
import { readDone } from "@/lib/progress";
import { Inline } from "@/components/blocks/Inline";

export function ChapterList({ chapters, current }: { chapters: ChapterLink[]; current: number }) {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => setDone(readDone()), []);
  return (
    <nav className="side" aria-label="অধ্যায়ের তালিকা">
      <p className="side-h">অধ্যায়</p>
      <ol>
        {chapters.map((c) => (
          <li key={c.n}>
            <Link href={`/chapters/${c.slug}`} aria-current={c.n === current ? "page" : undefined} className={done.includes(c.slug) ? "done" : undefined}>
              <span className="u">{chapterUnit(c.n)}</span>{c.short}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionNav({ toc }: { toc: TocItem[] }) {
  const [cur, setCur] = useState<string | null>(null);
  useEffect(() => {
    const s = (e: Event) => setCur((e as CustomEvent<string>).detail);
    window.addEventListener("miu:section", s);
    return () => window.removeEventListener("miu:section", s);
  }, []);
  return (
    <aside className="mini" aria-label="এই অধ্যায়ে">
      <p className="side-h">এই অধ্যায়ে</p>
      <ol>{toc.map((t) => <li key={t.sid}><a href={`#${t.sid}`} aria-current={cur === t.sid ? "location" : undefined}><Inline text={t.text} /></a></li>)}</ol>
      <a className="report" href="#quick">ভুল পেয়েছ? জানাও</a>
    </aside>
  );
}
