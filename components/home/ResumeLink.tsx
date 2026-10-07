"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readLast } from "@/lib/progress";

// "যেখানে থেমেছিলে" — শেষ পড়া অধ্যায় (পুরনো site-এর অগ্রগতিও মানে)
export function ResumeLink() {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => { const l = readLast(); if (l && /^ch\d\d$/.test(l.page)) setSlug(l.page); }, []);
  if (!slug) return null;
  return <Link className="btn" href={`/chapters/${slug}`}>যেখানে থেমেছিলে</Link>;
}
