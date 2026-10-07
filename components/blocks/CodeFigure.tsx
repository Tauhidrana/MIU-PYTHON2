"use client";
// কোড ব্লক: "কপি" বাটন সবখানে, Python কোডে "▶ চালাও" আর Live Output panel
import { useEffect, useRef, useState } from "react";
import { filesFor, registerFile, run, stop, type Sink } from "@/lib/pyrun";

type Props = {
  id?: string;
  code: string;
  label: string;          // Python / Terminal / Text / Syntax
  file?: string;
  numbered?: boolean;
  variant?: "" | "mini" | "term" | "text";
  runnable?: boolean;
  defaultStdin?: string;  // বইয়ের output-এ দেখানো input মানগুলো
  registerAs?: string;    // অন্য কোড এই ফাইলটা import/open করতে পারে
};

type Line = { text: string; kind: string };

export function CodeFigure({ id, code, label, file, numbered = true, variant = "", runnable, defaultStdin = "", registerAs }: Props) {
  const lines = code.split("\n");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [out, setOut] = useState<Line[]>([]);
  const [status, setStatus] = useState<{ text: string; cls: string }>({ text: "", cls: "" });
  const [stdin, setStdin] = useState(defaultStdin);
  const outRef = useRef<HTMLPreElement>(null);
  const fresh = useRef(false);
  const needsIn = /\binput\s*\(/.test(code);

  useEffect(() => (id && registerAs ? registerFile(id, registerAs, code) : undefined), [id, registerAs, code]);
  useEffect(() => { if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight; }, [out]);

  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard বন্ধ থাকলে কিছু করার নেই */ }
  }

  function go() {
    setOpen(true);
    stop(); // আগের run চললে সেটা আগে থামুক, যাতে তার "থেমেছে" নতুন output-এর সাথে না মেশে
    fresh.current = true; // আগের output থাকে, নতুন output আসা মাত্র মুছে যায়
    const sink: Sink = {
      status: (text) => setStatus({ text, cls: "busy" }),
      out: (text, kind) => {
        if (fresh.current) { fresh.current = false; setOut([{ text, kind }]); }
        else setOut((o) => [...o, { text, kind }]);
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
      },
    };
    run(code, stdin, sink, id ? filesFor(id) : {});
  }

  const cls = ["code", variant].filter(Boolean).join(" ");
  return (
    <>
      <figure className={cls} data-code="">
        <figcaption>
          <span>{label}</span>
          {file ? <span className="fn">{file}</span> : <span className="fn" />}
          <button type="button" className="code-btn" onClick={copy} aria-label="কোড কপি করো">{copied ? "✓ কপি হয়েছে" : "কপি"}</button>
          {runnable && <button type="button" className="code-btn run" onClick={go} aria-label="এই কোড চালাও">▶ চালাও</button>}
        </figcaption>
        <pre><code>{lines.map((l, i) => (
          <span key={i}>{numbered && <span className="ln" aria-hidden="true">{i + 1}</span>}{l || " "}{"\n"}</span>
        ))}</code></pre>
      </figure>
      {runnable && open && (
        <div className="run-panel" data-code="">
          <div className="run-head">
            <span className="title">Live Output</span>
            <span className={`run-status ${status.cls}`}>{status.text}</span>
            <span className="grow" />
            <button type="button" onClick={go}>↻ আবার</button>
            <button type="button" onClick={() => stop()}>থামাও</button>
            <button type="button" onClick={() => { stop(); setOpen(false); }} aria-label="বন্ধ করো">✕</button>
          </div>
          {needsIn && (
            <label className="run-stdin">
              <span>Input — প্রতি লাইনে একটা মান (বদলে আবার চালাও)</span>
              <textarea rows={2} spellCheck={false} value={stdin} onChange={(e) => setStdin(e.target.value)} />
            </label>
          )}
          <pre className="run-out" ref={outRef} aria-live="polite">{out.map((o, i) => <span key={i} className={`o-${o.kind}`}>{o.text}</span>)}</pre>
        </div>
      )}
    </>
  );
}
