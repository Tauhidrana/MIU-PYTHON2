"use client";
// মোবাইলের নিচের মেনু — ডেস্কটপে লুকানো
import Link from "next/link";
import { Icon } from "./Icons";
import { openToc } from "./TocDrawer";

export function BottomNav({ active }: { active?: "home" | "read" | "runner" | "feedback" }) {
  const cur = (k: string) => (k === active ? { "aria-current": "page" as const, className: "on" } : {});
  return (
    <nav className="bnav" aria-label="মোবাইল মেনু">
      <Link href="/" {...cur("home")}><Icon name="home" /><span>হোম</span></Link>
      <button type="button" onClick={openToc} className={active === "read" ? "on" : undefined}><Icon name="book" /><span>অধ্যায়</span></button>
      <Link href="/runner" {...cur("runner")}><Icon name="run" /><span>কোড রানার</span></Link>
      <Link href="/feedback" {...cur("feedback")}><Icon name="chat" /><span>মতামত</span></Link>
    </nav>
  );
}
