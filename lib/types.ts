// বইয়ের content-এর typed রূপ — scripts/convert.ts tools/source/final_NN.json থেকে এগুলো বানায়।
// প্রতিটা block-এর `id` স্থায়ী (অধ্যায় + source-এ ক্রম), তাই highlight/bookmark এর উপর ভর করে থাকতে পারে।

export type Video = { id: string; title: string; channel: string; date: string; lang: "bn" | "hi" };

export type BoxItem = { k: "p"; text: string } | { k: "bullets"; items: string[] } | { k: "code"; code: string };

export type BoxKind =
  | "analogy" | "tip" | "practice" | "note" | "oop" | "exam" | "remember" | "definition" | "answer";

export type Mistake = { wrong: string; right: string; why: string; wrongOut?: string };

export type ExplainRow = { label: string; snippet: string; text: string };

type B<T extends string, P> = { t: T; id: string } & P;

export type Block =
  | B<"chapter", { num: string; title: string; intro: string[]; video?: Video }>
  | B<"h2", { text: string; sid: string; tag?: string; video?: Video }>
  | B<"h3", { text: string }>
  | B<"p", { text: string }>
  | B<"bullets", { items: string[] }>
  | B<"numbers", { items: string[] }>
  | B<"table", { headers: string[]; rows: string[][]; mono: number[] }>
  | B<"example", { label: string; title: string; problem: string }>
  | B<"syntax", { code: string; note?: string }>
  | B<"code", { lang: "python" | "terminal" | "text"; file: string; code: string; output?: string }>
  | B<"explain", { rows: ExplainRow[] }>
  | B<"box", { kind: BoxKind; title: string; items: BoxItem[] }>
  | B<"mistakes", { items: Mistake[] }>
  | B<"img", { src: string; caption: string; width: number; height: number }>
  | B<"q", { num: string; text: string; stars: number; ref?: string }>
  | B<"section", { text: string }>
  | B<"paperhead", { lines: string[]; left: string; right: string; instr: string }>
  // লক করা অংশের জায়গা — আসল block-গুলো শুধু /api/exercise থেকে আসে (group = response-এর blocks[group])
  | B<"locked", { group: number; first: boolean; weight: number }>;

export type BlockOf<T extends Block["t"]> = Extract<Block, { t: T }>;

export type TocItem = { sid: string; text: string };

export type ChapterMeta = {
  n: number;
  slug: string;        // "ch01"
  num: string;         // "অধ্যায় ১"
  title: string;       // "Python Functions"
  short: string;       // পাশের তালিকার ছোট নাম
  topics: string;      // হোমপেজের তালিকায় টপিক
  desc: string;        // meta/og description
  toc: TocItem[];
  weight: number;      // মোট লেখার পরিমাণ (লক করা অংশসহ) — পুরো বইয়ের পাতা নম্বর আন্দাজে
  locked: boolean;
};

export type Chapter = ChapterMeta & { blocks: Block[] };

// /api/exercise-এর response
export type LockedResponse = { ch: number; blocks: Block[][] };
