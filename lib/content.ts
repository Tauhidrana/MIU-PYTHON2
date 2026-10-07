// Build-এর সময় convert.ts-এর বানানো JSON পড়ে — শুধু server-এ (SSG) চলে
import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Chapter, ChapterMeta } from "./types";

const GEN = path.join(process.cwd(), "content", "generated");
const read = <T,>(f: string): T => JSON.parse(fs.readFileSync(path.join(GEN, f), "utf8"));

export function getChapters(): ChapterMeta[] {
  return read<ChapterMeta[]>("chapters.json");
}
export function getChapter(slug: string): Chapter | null {
  if (!/^ch(0[1-9]|1[0-2])$/.test(slug)) return null;
  return read<Chapter>(`${slug}.json`);
}
