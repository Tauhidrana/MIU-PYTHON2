"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readDone, readLast } from "@/lib/progress";
import { bn, chapterLabel } from "@/lib/site";

// "যেখানে থেমেছিলে" — শেষ পড়া অধ্যায় আর সেটার কতটা পড়া হয়েছে (পুরনো site-এর অগ্রগতিও মানে)
export function ResumeLink() {
  const [last, setLast] = useState<{ slug: string; pct: number | null } | null>(null);
  useEffect(() => {
    const l = readLast();
    if (l && /^ch\d\d$/.test(l.page)) setLast({ slug: l.page, pct: l.frac != null ? Math.round(l.frac * 100) : null });
  }, []);
  if (!last) return null;
  const where = chapterLabel(Number(last.slug.slice(2)));
  return (
    <Link className="btn resume" href={`/chapters/${last.slug}`}>
      <span>যেখানে থেমেছিলে</span>
      <small>{where}{last.pct != null && <> · {bn(last.pct)}%</>}</small>
      {last.pct != null && <i className="resume-bar" style={{ transform: `scaleX(${last.pct / 100})` }} aria-hidden="true" />}
    </Link>
  );
}

// সূচিপত্রে কোন অধ্যায় শেষ (✓) আর কোনটা এখন পড়ছ — server-এ বানানো তালিকায় শুধু data-state বসায়
export function ContentsState() {
  useEffect(() => {
    const done = readDone();
    const cur = readLast()?.page;
    document.querySelectorAll<HTMLElement>(".contents [data-slug]").forEach((a) => {
      const s = a.dataset.slug!;
      if (s === cur) a.dataset.state = "reading";
      else if (done.includes(s)) a.dataset.state = "done";
    });
  }, []);
  return null;
}
