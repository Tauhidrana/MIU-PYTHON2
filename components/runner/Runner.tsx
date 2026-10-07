"use client";
// কোড রানার — নিজে লিখে চালাও। কোড আর input এই browser-এ আপনা-আপনি save থাকে (পুরনো site-এর key-তেই)।
import { useEffect, useRef, useState } from "react";
import { run, stop, type Sink } from "@/lib/pyrun";

const SAMPLES: Record<string, [string, string]> = {
  hello: ['print("Hello, Python!")\nprint("২ + ৩ =", 2 + 3)', ""],
  input: ['name = input("তোমার নাম: ")\nmarks = int(input("নম্বর: "))\nprint("স্বাগতম,", name)\nprint("পাস" if marks >= 40 else "ফেল")', "Rahim\n72"],
  loop: ['for i in range(1, 11):\n    print(5, "x", i, "=", 5 * i)', ""],
  class: ['class Student:\n    def __init__(self, name, cgpa):\n        self.name = name\n        self.cgpa = cgpa\n\n    def show(self):\n        print(self.name, "-", self.cgpa)\n\ns = Student("Sumaiya", 3.9)\ns.show()', ""],
};
const KEYS: [string, string, string?][] = [
  ["    ", "⇥", "Tab — ৪টা space"], [":", ":"], ["()", "("], [")", ")"], ['""', '"'], ["''", "'"], ["[]", "["], ["]", "]"], ["=", "="], ["_", "_"],
  ["# ", "#"], ["+", "+"], ["-", "-"], ["*", "*"], ["/", "/"], ["<", "<"], [">", ">"], ["{}", "{"], ["}", "}"], [",", ","], [".", "."],
];
const PAIRS = ["()", "[]", "{}", '""', "''"];

type Line = { text: string; kind: string };

export function Runner() {
  const ed = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLPreElement>(null);
  const outRef = useRef<HTMLPreElement>(null);
  const fresh = useRef(false);
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [out, setOut] = useState<Line[]>([]);
  const [status, setStatus] = useState({ text: "", cls: "" });
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("runner-code"); if (saved !== null) { setCode(saved); setStdin(localStorage.getItem("runner-stdin") || ""); } } catch { /* storage বন্ধ */ }
    if (saved === null) { setCode(SAMPLES.hello[0]); setStdin(SAMPLES.hello[1]); }
    setLoaded(true);
  }, []);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem("runner-code", code); localStorage.setItem("runner-stdin", stdin); } catch { /* storage বন্ধ */ } }, [loaded, code, stdin]);
  useEffect(() => { if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight; }, [out]);

  const lineCount = code.split("\n").length;

  function insert(t: string, back = 0) {
    const el = ed.current!;
    el.focus();
    const s = el.selectionStart, e = el.selectionEnd;
    el.setRangeText(t, s, e, "end");
    if (back) el.selectionStart = el.selectionEnd = el.selectionStart - back;
    setCode(el.value);
  }

  function go() {
    stop();
    fresh.current = true;
    setBusy(true);
    if (matchMedia("(max-width: 860px)").matches) { // মোবাইলে keyboard বন্ধ করে output দেখাও
      ed.current?.blur();
      outRef.current?.closest(".pane")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    const sink: Sink = {
      status: (text) => setStatus({ text, cls: "busy" }),
      out: (text, kind) => {
        if (fresh.current) { fresh.current = false; setOut([{ text, kind }]); } else setOut((o) => [...o, { text, kind }]);
      },
      done: (ok, err, stopped) => {
        const wasFresh = fresh.current; fresh.current = false;
        setOut((o) => {
          let cur = wasFresh ? [] : o;
          if (err) cur = [...cur, { text: (cur.length ? "\n" : "") + err, kind: stopped ? "note" : "error" }];
          if (!cur.length) cur = [{ text: "(কোনো output নেই)", kind: "note" }];
          return cur;
        });
        setStatus(stopped ? { text: "থেমেছে", cls: "" } : ok ? { text: "✓ সফল", cls: "ok" } : { text: "✗ Error", cls: "bad" });
        setBusy(false);
      },
    };
    run(code, stdin, sink);
  }

  return (
    <>
      <div className="runner">
        <section className="pane">
          <div className="pane-bar">
            <span className="pane-name">main.py</span>
            <select aria-label="উদাহরণ বেছে নাও" value="" onChange={(e) => { const s = SAMPLES[e.target.value]; if (s) { setCode(s[0]); setStdin(s[1]); ed.current?.focus(); } }}>
              <option value="">উদাহরণ…</option><option value="hello">Hello</option><option value="input">input() দিয়ে</option><option value="loop">for loop</option><option value="class">Class ও Object</option>
            </select>
            <button type="button" onClick={() => { setCode(""); setStdin(""); ed.current?.focus(); }}>নতুন</button>
            <button type="button" className="go" onClick={go} disabled={busy}>▶ চালাও</button>
          </div>
          <div className="keys" role="toolbar" aria-label="চিহ্ন বসাও" onPointerDown={(e) => { if ((e.target as Element).closest("button")) e.preventDefault(); }}>
            {KEYS.map(([ins, label, aria]) => (
              <button key={label} type="button" aria-label={aria} onClick={() => insert(ins, PAIRS.includes(ins) ? 1 : 0)}>{label}</button>
            ))}
          </div>
          <div className="editor">
            <pre className="gutter" ref={gutter} aria-hidden="true">{Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}</pre>
            <textarea
              ref={ed}
              value={code}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              wrap="off"
              aria-label="Python কোড"
              onChange={(e) => setCode(e.target.value)}
              onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); go(); return; }
                if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); insert("    "); return; }
                if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
                  const el = e.currentTarget, before = el.value.slice(0, el.selectionStart), line = before.slice(before.lastIndexOf("\n") + 1);
                  e.preventDefault();
                  insert("\n" + (line.match(/^ */)![0]) + (/:\s*$/.test(line) ? "    " : ""));
                }
              }}
            />
          </div>
        </section>
        <section className="pane io">
          <label className="pane-bar" htmlFor="rx-stdin"><span className="pane-name">Input</span><small>input() থাকলে প্রতি লাইনে একটা মান</small></label>
          <textarea id="rx-stdin" rows={3} spellCheck={false} value={stdin} onChange={(e) => setStdin(e.target.value)} />
          <div className="pane-bar">
            <span className="pane-name">Output</span>
            <span className={`run-status ${status.cls}`}>{status.text}</span>
            <button type="button" onClick={() => stop()}>থামাও</button>
            <button type="button" onClick={() => { setOut([]); setStatus({ text: "", cls: "" }); }}>মুছো</button>
          </div>
          <pre className="run-out" ref={outRef} aria-live="polite">{out.map((o, i) => <span key={i} className={`o-${o.kind}`}>{o.text}</span>)}</pre>
        </section>
      </div>
      <p className="hint"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> = চালাও · <kbd>Tab</kbd> = ৪টা space · তোমার কোড এই browser-এ আপনা-আপনি save থাকে।</p>
    </>
  );
}
