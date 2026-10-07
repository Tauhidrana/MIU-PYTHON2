// tools/source/final_NN.json → typed data
//   content/generated/chNN.json   — অধ্যায়ের খোলা অংশ (লক করা অংশের জায়গায় শুধু placeholder)
//   content/generated/chapters.json — সব অধ্যায়ের meta (সূচি, পাতা আন্দাজের weight)
//   content/locked/chNN.json      — লক করা অংশের আসল block, শুধু /api/exercise পড়ে; কখনো client bundle-এ যায় না
// লকের নিয়ম tools/build_site.py-এর মতোই: FREE_CHAPTERS বাদে "অনুশীলনী" heading-এর পরের সব, আর পরিশিষ্টের (ch12) সব।
import fs from "node:fs";
import path from "node:path";
import type { Block, BoxItem, BoxKind, Chapter, ChapterMeta, ExplainRow, TocItem, Video } from "../lib/types";

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "tools", "source");
const GEN = path.join(ROOT, "content", "generated");
const LOCKED = path.join(ROOT, "content", "locked");
const IMG_OUT = path.join(ROOT, "public", "img");

const FREE_CHAPTERS = new Set([1, 2]); // lib/unlock.js-এর LOCKED_CHAPTERS-এর সাথে মিল থাকতে হবে
const KINDS: Record<BoxKind, string> = {
  analogy: "বাস্তব উদাহরণ", tip: "Exam Tip", practice: "অনুশীলন", note: "নোট", oop: "OOP-এর সাথে যোগসূত্র",
  exam: "সম্ভাব্য পরীক্ষার প্রশ্ন", remember: "মনে রাখো", definition: "সংজ্ঞা (পরীক্ষার জন্য)", answer: "উত্তর",
};
const TOPICS: Record<number, string> = {
  1: "def, argument, pass by value/reference, datetime", 2: "file mode, open ও close, read ও write",
  3: "module, package, application software-এর পরিচয়", 4: "class, object, constructor, self",
  5: "inheritance, encapsulation, polymorphism, abstraction", 6: "iter ও next, yield, @decorator",
  7: "try, except, else, finally, raise", 8: "level, handler, formatter, basicConfig",
  9: "unittest, TestCase, assertion", 10: "pattern, meta character, search, findall, sub",
  11: "শ্রেণিবিভাগ, বৈশিষ্ট্য, কাজ ও একটি পূর্ণ প্রকল্প", 12: "২০২২–২০২৫ সালের প্রশ্নপত্র, বিশ্লেষণ ও সাজেশন",
};
const SHORT: Record<number, string> = {
  1: "Python Functions", 2: "File Operation", 3: "Module, Package ও Application Software", 4: "Basics of OOP",
  5: "Four Pillars of OOP", 6: "Iterator, Generator ও Decorator", 7: "Exception ও Error Handling", 8: "Logging",
  9: "Unit Testing", 10: "RegEx", 11: "Application Software", 12: "বোর্ড প্রশ্ন ও সাজেশন",
};
const DESC: Record<number, string> = {
  1: "অধ্যায় ১: Python Function — def, argument, return, pass by value ও reference আর datetime, চালানো যায় এমন কোডসহ সহজ বাংলায়।",
  2: "অধ্যায় ২: Python-এ File Operation — file mode, open ও close, read ও write দিয়ে file-এ তথ্য রাখা ও পড়া, উদাহরণসহ সহজ বাংলায়।",
  3: "অধ্যায় ৩: Python Module ও Package — নিজের module ও package বানানো, import, আর Application Software-এর পরিচয় সহজ বাংলায়।",
  4: "অধ্যায় ৪: OOP-এর মূল কথা — class, object, constructor (__init__) ও self, Python উদাহরণ ও কোডসহ সহজ বাংলায়।",
  5: "অধ্যায় ৫: OOP-এর চার স্তম্ভ — inheritance, encapsulation, polymorphism ও abstraction, Python কোড ও উদাহরণসহ সহজ বাংলায়।",
  6: "অধ্যায় ৬: Python Iterator, Generator ও Decorator — iter ও next, yield আর @decorator কীভাবে কাজ করে, উদাহরণসহ সহজ বাংলায়।",
  7: "অধ্যায় ৭: Python-এ Exception ও Error Handling — try, except, else, finally ও raise, উদাহরণ ও কোডসহ সহজ বাংলায়।",
  8: "অধ্যায় ৮: Python Logging — log level, handler, formatter ও basicConfig দিয়ে program-এর log রাখা, উদাহরণসহ সহজ বাংলায়।",
  9: "অধ্যায় ৯: Python-এ Unit Testing — unittest, TestCase ও assertion দিয়ে test লেখা ও চালানো, উদাহরণসহ সহজ বাংলায়।",
  10: "অধ্যায় ১০: Python RegEx — pattern, metacharacter, search, findall ও sub দিয়ে লেখায় শব্দ খোঁজা ও বদলানো, সহজ বাংলায়।",
  11: "অধ্যায় ১১: Application Software — প্রকারভেদ, বৈশিষ্ট্য ও কাজ, আর Python ও Flask দিয়ে Student Result Management System প্রকল্প।",
  12: "পরিশিষ্ট: Application Development Using Python-এর ২০২২–২০২৫ সালের বোর্ড প্রশ্নপত্র, প্রশ্ন বিশ্লেষণ ও সাজেশন।",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any;
const videos: Record<string, Video> = JSON.parse(fs.readFileSync(path.join(SRC, "videos.json"), "utf8"));

// PNG-এর মাপ (IHDR) — next/image-এর width/height, যাতে লোডের সময় পাতা না লাফায়
function pngSize(file: string) {
  const b = fs.readFileSync(file);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

// পাতা আন্দাজের জন্য block-এর "ওজন" — মোটামুটি কত অক্ষরের জায়গা নেয়
function weight(b: Block): number {
  const s = (x: string) => x.length;
  switch (b.t) {
    case "chapter": return 900 + b.intro.reduce((a, x) => a + s(x), 0);
    case "h2": return 160 + (b.video ? 500 : 0);
    case "h3": return 90;
    case "p": case "section": return s(b.text) + 30;
    case "bullets": case "numbers": return b.items.reduce((a, x) => a + s(x) + 30, 0);
    case "table": return (b.rows.length + 1) * 90 + b.rows.flat().reduce((a, x) => a + s(x), 0) / 2;
    case "example": return s(b.title) + s(b.problem) + 120;
    case "syntax": return b.code.split("\n").length * 70 + 120;
    case "code": return b.code.split("\n").length * 70 + 120 + (b.output ? b.output.split("\n").length * 70 + 90 : 0);
    case "explain": return b.rows.reduce((a, r) => a + s(r.text) + 60, 60);
    case "box": return 120 + b.items.reduce((a, it) => a + (it.k === "p" ? s(it.text) : it.k === "bullets" ? it.items.join("").length + 30 * it.items.length : it.code.split("\n").length * 70), 0);
    case "mistakes": return b.items.reduce((a, m) => a + (m.wrong.split("\n").length + m.right.split("\n").length) * 70 + s(m.why) + 200, 80);
    case "img": return 900;
    case "q": return s(b.text) + 60;
    case "paperhead": return 500;
    case "locked": return b.weight;
  }
}

function convertChapter(n: number): { chapter: Chapter; locked: Block[][] } {
  const raw: Raw[] = JSON.parse(fs.readFileSync(path.join(SRC, `final_${String(n).padStart(2, "0")}.json`), "utf8"));
  const out: Block[] = [];
  const groups: Block[][] = [];
  const toc: TocItem[] = [];
  let buf: Block[] = [];
  let lastPy = "";
  let sec = 0;
  let locking = false;
  const flush = () => {
    if (!buf.length) return;
    const first = groups.length === 0;
    groups.push(buf);
    out.push({ t: "locked", id: `${n}-L${groups.length - 1}`, group: groups.length - 1, first, weight: buf.reduce((a, b) => a + weight(b), 0) });
    buf = [];
  };

  raw.forEach((b, i) => {
    const t: string = b.t;
    const id = `${n}-${i}`;
    if (t === "h2" && String(b.text).startsWith("অনুশীলনী") && !FREE_CHAPTERS.has(n)) locking = true;
    const lockThis = (locking && t !== "h2") || (n === 12 && t !== "chapter" && t !== "h2");
    if (!lockThis) flush();

    let block: Block | null = null;
    switch (t) {
      case "chapter":
        block = { t, id, num: b.num, title: b.title, intro: b.intro, video: videos[`${n}:chapter`] };
        break;
      case "h2": {
        sec++;
        const sid = `s${sec}`;
        toc.push({ sid, text: b.text });
        block = { t, id, sid, text: b.text, tag: b.tag || undefined, video: videos[`${n}:${sid}`] };
        break;
      }
      case "h3": case "p": block = { t, id, text: b.text }; break;
      case "section": block = { t, id, text: b.text }; break;
      case "bullets": case "numbers": block = { t, id, items: b.items }; break;
      case "table": block = { t, id, headers: b.headers, rows: b.rows, mono: b.mono || [] }; break;
      case "example": block = { t, id, label: b.label, title: b.title, problem: b.problem }; break;
      case "syntax": block = { t, id, code: b.code, note: b.note || undefined }; break;
      case "code": {
        if (b.hidden) break;
        const f: string | null = b.file;
        if (f && f.startsWith("Terminal")) block = { t, id, lang: "terminal", file: f.replace("Terminal", "").replace(/^[:\s]+|[:\s]+$/g, ""), code: b.code };
        else if (f && !f.endsWith(".py")) block = { t, id, lang: "text", file: f, code: b.code };
        else { block = { t, id, lang: "python", file: f || "main.py", code: b.code }; lastPy = b.code; }
        if (b.output) block.output = b.output;
        break;
      }
      case "explain": {
        const lines = lastPy.split("\n");
        const rows: ExplainRow[] = b.rows.map(([ref, text]: [number | [number, number] | null, string]) => {
          if (Array.isArray(ref)) return { label: `${ref[0]}–${ref[1]}`, snippet: lines.slice(ref[0] - 1, ref[1]).join("\n"), text };
          if (ref == null) return { label: "", snippet: "", text };
          return { label: String(ref), snippet: lines.slice(ref - 1, ref).join("\n"), text };
        });
        block = { t, id, rows };
        break;
      }
      case "box": {
        const items: BoxItem[] = b.items.map((it: Raw) =>
          typeof it === "string" ? { k: "p", text: it } : it[0] === "bullets" ? { k: "bullets", items: it[1] } : { k: "code", code: it[1] });
        block = { t, id, kind: b.kind, title: b.title || KINDS[b.kind as BoxKind] || "", items };
        break;
      }
      case "mistakes":
        block = { t, id, items: b.items.map((m: Raw) => ({ wrong: m.wrong, right: m.right, why: m.why, wrongOut: m.wrong_out ? String(m.wrong_out).split("\n").pop() : undefined })) };
        break;
      case "img": {
        const fn = path.basename(b.path);
        fs.copyFileSync(path.join(SRC, b.path), path.join(IMG_OUT, fn));
        block = { t, id, src: `/img/${fn}`, caption: b.caption || "", ...pngSize(path.join(SRC, b.path)) };
        break;
      }
      case "q": block = { t, id, num: b.num, text: b.text, stars: b.stars || 0, ref: b.ref || undefined }; break;
      case "paperhead": block = { t, id, lines: b.lines, left: b.left, right: b.right, instr: b.instr }; break;
      case "pagebreak": break;
      default: throw new Error(`অজানা block: ${t} (ch${n} #${i})`);
    }
    if (!block) return;
    if (lockThis) buf.push(block); else out.push(block);
  });
  flush();

  const head = out[0];
  if (head.t !== "chapter") throw new Error(`ch${n}: প্রথম block chapter নয়`);
  const meta: ChapterMeta = {
    n, slug: `ch${String(n).padStart(2, "0")}`, num: head.num, title: head.title, short: SHORT[n], topics: TOPICS[n],
    desc: DESC[n], toc, weight: Math.round(out.reduce((a, b) => a + weight(b), 0)), locked: groups.length > 0,
  };
  return { chapter: { ...meta, blocks: out }, locked: groups };
}

fs.mkdirSync(GEN, { recursive: true });
fs.mkdirSync(LOCKED, { recursive: true });
fs.mkdirSync(IMG_OUT, { recursive: true });
const metas: ChapterMeta[] = [];
for (let n = 1; n <= 12; n++) {
  const { chapter, locked } = convertChapter(n);
  const { blocks: _b, ...meta } = chapter;
  metas.push(meta);
  fs.writeFileSync(path.join(GEN, `${chapter.slug}.json`), JSON.stringify(chapter));
  const lf = path.join(LOCKED, `${chapter.slug}.json`);
  if (locked.length) fs.writeFileSync(lf, JSON.stringify(locked));
  else if (fs.existsSync(lf)) fs.rmSync(lf);
  // নিরাপত্তা-যাচাই: লক করা লেখার কোনো অংশ যেন খোলা ফাইলে না থাকে
  const pub = JSON.stringify(chapter);
  for (const g of locked) for (const b of g) {
    const probe = "text" in b ? b.text : "code" in b ? b.code : null;
    if (probe && probe.length > 40 && pub.includes(probe)) throw new Error(`ch${n}: লক করা লেখা খোলা অংশেও আছে (${b.id})`);
  }
}
fs.writeFileSync(path.join(GEN, "chapters.json"), JSON.stringify(metas));
console.log(`convert: ${metas.length} অধ্যায়, মোট weight ${metas.reduce((a, m) => a + m.weight, 0)}`);
