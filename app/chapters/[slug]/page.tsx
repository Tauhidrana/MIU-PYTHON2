import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter, getChapters } from "@/lib/content";
import { Blocks } from "@/components/blocks/Blocks";
import { LockProvider } from "@/components/lock/LockProvider";
import { TopBar } from "@/components/chrome/TopBar";
import { Footer } from "@/components/chrome/Footer";
import { BottomNav } from "@/components/chrome/BottomNav";
import { TocDrawer } from "@/components/chrome/TocDrawer";
import { ScrollProgress } from "@/components/reader/ScrollProgress";
import { ChapterList, SectionNav } from "@/components/reader/SideNavs";
import { FeedbackForm, Rating } from "@/components/forms/FeedbackForm";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return getChapters().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getChapters().find((x) => x.slug === slug);
  if (!c) return {};
  const title = `${c.num}: ${c.title}`;
  return {
    title,
    description: c.desc,
    alternates: { canonical: `${SITE_URL}/chapters/${slug}` },
    openGraph: { type: "article", title: `${title} — Python বই`, description: c.desc, url: `${SITE_URL}/chapters/${slug}` },
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ch = getChapter(slug);
  if (!ch) notFound();
  const all = getChapters();
  const links = all.map(({ n, slug, short }) => ({ n, slug, short }));
  const prev = all[ch.n - 2], next = all[ch.n];

  return (
    <>
      <TopBar reader={<span className="reading-title" aria-hidden="true">{ch.num} · {ch.short}</span>} />
      <ScrollProgress slug={ch.slug} sids={ch.toc.map((t) => t.sid)} />
      <div className="reader-grid">
        <ChapterList chapters={links} current={ch.n} />
        <main id="main" className="sheet paper">
          <LockProvider ch={ch.n} hasLocked={ch.locked}>
            <article className="book" lang="bn">
              <Blocks blocks={ch.blocks} ch={ch.n} />
            </article>
          </LockProvider>

          <section className="quick" id="quick">
            <h2>এই অধ্যায় কেমন লাগল?</h2>
            <p>তোমার মতামত সরাসরি লেখকের কাছে যাবে। ভুল পেলে কোন section-এ, সেটাও লিখে দিও।</p>
            <FeedbackForm kind="অধ্যায়ের মতামত" submitLabel="মতামত পাঠাও">
              <input type="hidden" name="chapter" value={`${ch.num} — ${ch.title}`} />
              <Rating />
              <label className="fld"><span>তোমার নাম (ঐচ্ছিক)</span><input name="name" autoComplete="name" /></label>
              <label className="fld"><span>মতামত বা যে ভুল পেয়েছ</span><textarea name="message" rows={4} required placeholder="যেমন: 4.5-এর উদাহরণটা বুঝতে কষ্ট হয়েছে, কারণ…" /></label>
            </FeedbackForm>
          </section>

          <nav className="pager" aria-label="অধ্যায় বদলাও">
            {prev ? <Link className="pn prev" href={`/chapters/${prev.slug}`}><small>← আগের অধ্যায়</small>{prev.short}</Link> : <span />}
            {next ? <Link className="pn next" href={`/chapters/${next.slug}`}><small>পরের অধ্যায় →</small>{next.short}</Link> : <span />}
          </nav>
        </main>
        <SectionNav toc={ch.toc} />
      </div>
      <Footer />
      <BottomNav active="read" />
      <TocDrawer chapters={links} current={ch.n} toc={ch.toc} />
    </>
  );
}
