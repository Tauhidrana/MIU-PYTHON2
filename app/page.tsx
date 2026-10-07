import Link from "next/link";
import { getChapters } from "@/lib/content";
import { TopBar } from "@/components/chrome/TopBar";
import { Footer } from "@/components/chrome/Footer";
import { BottomNav } from "@/components/chrome/BottomNav";
import { TocDrawer } from "@/components/chrome/TocDrawer";
import { BookCover } from "@/components/home/BookCover";
import { ResumeLink } from "@/components/home/ResumeLink";
import { CodeFigure } from "@/components/blocks/CodeFigure";
import { chapterLabel, SITE_URL } from "@/lib/site";

export const metadata = { alternates: { canonical: `${SITE_URL}/` }, openGraph: { url: `${SITE_URL}/` } };

const PEEK = `class Student:
    def __init__(self, name, cgpa):
        self.name = name
        self.__cgpa = cgpa

s1 = Student("Rahim", 3.75)
print(s1.name, "joined MIU")`;

export default function Home() {
  const chapters = getChapters();
  const links = chapters.map(({ n, slug, short }) => ({ n, slug, short }));
  return (
    <>
      <TopBar />
      <main id="main" className="home">
        <section className="hero">
          <div className="hero-text">
            <p className="kicker">বাকাশিবো · ডিপ্লোমা ইন ইঞ্জিনিয়ারিং · বিষয় কোড ২৮৫৩১</p>
            <h1>Application Development <span>Using Python</span></h1>
            <p className="sub">পুরো syllabus — Unit 1 থেকে Unit 11 — সহজ বাংলায়। প্রতিটা উদাহরণের কোড চালিয়ে যাচাই করা, প্রতিটা অধ্যায়ের শেষে বিগত বছরের বোর্ড প্রশ্নের উত্তর।</p>
            <div className="cta">
              <Link className="btn primary" href="/chapters/ch01">পড়া শুরু করো</Link>
              <ResumeLink />
              <Link className="btn" href="/runner">▶ কোড রানার</Link>
              <Link className="btn" href="/pdf">📘 PDF নিতে আগ্রহী?</Link>
            </div>
            <p className="author">লেখক: <strong>Kazi Tauhid Rana</strong> · Computer Science and Technology, Rajshahi Polytechnic Institute</p>
          </div>
          <BookCover />
        </section>

        <section className="peek">
          <div className="peek-code">
            <CodeFigure code={PEEK} label="Python" file="main.py" runnable />
            <figure className="output"><figcaption>Output</figcaption><pre>Rahim joined MIU</pre></figure>
          </div>
          <div className="peek-text">
            <h2>বইটা যেভাবে পড়াবে</h2>
            <ul>
              <li><strong>উদাহরণ ধরে ধরে।</strong> প্রতিটা ধারণার সাথে সমস্যা, কোড, output আর লাইন-বাই-লাইন ব্যাখ্যা।</li>
              <li><strong>ভুল থেকে শেখা।</strong> নতুনরা যে ভুলগুলো সবচেয়ে বেশি করে, পাশাপাশি ভুল আর সঠিক কোড।</li>
              <li><strong>পরীক্ষার কথা মাথায় রেখে।</strong> ২০২২–২০২৫ সালের সব বোর্ড প্রশ্ন, গুরুত্ব অনুযায়ী ★ দিয়ে, খাতায় লেখার মতো উত্তরসহ।</li>
              <li><strong>প্রতিটা টপিকের ভিডিও।</strong> প্রতিটা টপিকের সাথে YouTube থেকে বাছাই করা বাংলা ভিডিও ক্লাস — যেটা পড়ছ, সেটাই দেখে নাও।</li>
              <li><strong>পাতাতেই কোড চালাও।</strong> প্রতিটা উদাহরণের পাশে &quot;চালাও&quot; বাটন, আর নিজে লিখে চালানোর জন্য আলাদা <Link href="/runner">কোড রানার</Link> — কিছু install করতে হবে না।</li>
              <li><strong>একটা পূর্ণ প্রকল্প।</strong> শেষ অধ্যায়ে পুরো বইয়ের জ্ঞান দিয়ে বানানো Student Result Management System।</li>
            </ul>
          </div>
        </section>

        <section className="chapters" id="chapters">
          <h2>সূচিপত্র</h2>
          <p className="hint">Syllabus-এর ক্রমেই সাজানো — একটার পর একটা পড়লে সবচেয়ে ভালো বুঝবে।</p>
          <ol className="contents paper">
            {chapters.map((c) => (
              <li key={c.n}>
                <Link href={`/chapters/${c.slug}`}>
                  <span className="unit">{chapterLabel(c.n)}</span>
                  <span className="ct">{c.title}</span>
                  <span className="dots" aria-hidden="true" />
                  <span className="cs">{c.topics}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="band">
          <div>
            <p className="tag">শীঘ্রই আসছে</p>
            <h2>বইটার PDF সংস্করণ</h2>
            <p>পুরো বই অফলাইনে, যেকোনো ডিভাইসে পড়ার জন্য PDF তৈরি হচ্ছে। দাম কত হবে — সেটা ঠিক হবে তোমাদের মতামত দেখেই। নিতে চাইলে নাম লিখে রাখো, তৈরি হলেই জানানো হবে।</p>
          </div>
          <Link className="btn primary" href="/pdf">আগ্রহ জানাও ও দাম বলো</Link>
        </section>
        <section className="band">
          <div>
            <h2>বইটা কেমন লাগল?</h2>
            <p>তোমার রিভিউ আর পরামর্শে পরের সংস্করণ আরও ভালো হবে। কোথাও ভুল পেলে সেটাও জানাও।</p>
          </div>
          <Link className="btn primary" href="/feedback">রিভিউ দাও</Link>
        </section>
      </main>
      <Footer />
      <BottomNav active="home" />
      <TocDrawer chapters={links} />
    </>
  );
}
