// Python চালানো — Pyodide আলাদা Web Worker-এ (public/py-worker.js) চলে, তাই infinite loop-এ পাতা আটকায় না।
// Worker (আর তার সাথে Pyodide) তৈরি হয় শুধু প্রথমবার "চালাও" চাপলে।
"use client";

export type Sink = {
  status(text: string): void;
  out(text: string, kind: "out" | "err" | "in"): void;
  done(ok: boolean, err: string, stopped?: boolean): void;
};

const MAX_OUT = 60000, MAX_MS = 20000, LOAD_MS = 60000;
const LOAD_FAIL = 'Python লোড করা যায়নি। Internet সংযোগ দেখে আবার "চালাও" চাপো।';

type Pending = { code: string; stdin: string; files: Record<string, string>; sink: Sink };
let worker: Worker | null = null;
let ready = false;
let pending: Pending | null = null;
let job: (Sink & { size: number }) | null = null;
let killTimer: ReturnType<typeof setTimeout> | undefined;
let loadTimer: ReturnType<typeof setTimeout> | undefined;

function boot() {
  if (worker) return;
  ready = false;
  worker = new Worker("/py-worker.js");
  worker.onmessage = onMessage;
  worker.onerror = () => fail(LOAD_FAIL);
  // CDN আটকে গেলে অনন্তকাল "লোড হচ্ছে" না দেখিয়ে এক মিনিট পরে error দেখাও
  clearTimeout(loadTimer);
  loadTimer = setTimeout(() => { if (!ready) fail('Python লোড হতে অনেক সময় লাগছে। Internet ধীর হতে পারে — একটু পরে আবার "চালাও" চাপো।'); }, LOAD_MS);
}
function fail(text: string) {
  clearTimeout(loadTimer);
  worker?.terminate();
  worker = null; ready = false;
  const j = job || pending?.sink;
  job = null; pending = null;
  j?.done(false, text);
}
function send(p: Pending) {
  job = Object.assign(p.sink, { size: 0 });
  job.status("চলছে…");
  clearTimeout(killTimer);
  killTimer = setTimeout(() => stop("২০ সেকেন্ডের বেশি চলছে, তাই থামিয়ে দেওয়া হলো। কোথাও infinite loop আছে কিনা দেখো।"), MAX_MS);
  worker!.postMessage({ type: "run", code: p.code, stdin: p.stdin, files: p.files });
}
function hint(t: string) {
  if (/ModuleNotFoundError/.test(t)) return "\n\n→ এই module browser-এ নেই, অথবা উদাহরণটার জন্য বইয়ের অন্য একটা .py ফাইল লাগে।";
  if (/EOFError/.test(t)) return "\n\n→ input() আরও মান চাইছে। Input ঘরে প্রতি লাইনে একটা করে মান লেখো।";
  return "";
}
function onMessage(ev: MessageEvent) {
  const m = ev.data;
  if (m.type === "ready") {
    ready = true; clearTimeout(loadTimer);
    if (pending) { const p = pending; pending = null; send(p); }
    return;
  }
  if (m.type === "fail") { fail(LOAD_FAIL); return; }
  if (!job) return;
  if (m.type === "out" || m.type === "err" || m.type === "in") {
    job.size += m.text.length;
    if (job.size > MAX_OUT) { stop("Output অনেক বড় হয়ে গেছে, তাই থামিয়ে দেওয়া হলো।"); return; }
    job.out(m.text, m.type);
  } else if (m.type === "done") {
    clearTimeout(killTimer);
    const j = job; job = null;
    j.done(m.ok, m.text ? m.text + hint(m.text) : "");
  }
}

export function run(code: string, stdin: string, sink: Sink, files: Record<string, string> = {}) {
  if (job || pending) stop();
  const p = { code, stdin, sink, files };
  boot();
  if (ready) send(p);
  else { pending = p; sink.status("Python লোড হচ্ছে… (প্রথমবার ১০–২০ সেকেন্ড)"); }
}
export function stop(reason?: string) {
  clearTimeout(killTimer);
  const j = job || pending?.sink;
  if (!j) return;
  job = null; pending = null;
  clearTimeout(loadTimer);
  worker?.terminate();
  worker = null; ready = false;
  j.done(false, reason || "থামানো হয়েছে।", true);
}

// ===== অধ্যায়ে দেখানো অন্য ফাইল (geometry.py, school/student.py, students.txt …) =====
// একই নামের একাধিক সংস্করণ থাকলে, যে কোড চালানো হচ্ছে তার আগেরটা (না থাকলে পরেরটা) নেওয়া হয়।
// ক্রম ধরা হয় block id-র source index দিয়ে ("5-123" → 123), তাই লক খোলা অংশের ফাইলও ঠিক জায়গায় বসে।
const named = new Map<string, { name: string; order: number; code: string }>();
const orderOf = (id: string) => Number(id.split("-")[1]) || 0;

export function registerFile(id: string, name: string, code: string) {
  named.set(id, { name, order: orderOf(id), code });
  return () => { named.delete(id); };
}
export function filesFor(id: string) {
  const me = orderOf(id);
  const pick: Record<string, { order: number; code: string }> = {};
  [...named.entries()].sort((a, b) => a[1].order - b[1].order).forEach(([fid, f]) => {
    if (fid === id) return;
    if (f.order < me || !pick[f.name]) pick[f.name] = f;
  });
  return Object.fromEntries(Object.entries(pick).map(([k, v]) => [k, v.code]));
}
