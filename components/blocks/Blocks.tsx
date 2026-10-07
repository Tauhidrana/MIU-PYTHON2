// Block[] → বইয়ের লেখা। Server-এ (অধ্যায়ের static HTML) আর client-এ (লক খোলার পর) — দুই জায়গাতেই একই renderer।
// প্রতিটা block-এর বাইরের element-এ data-bid থাকে: highlight/bookmark আর pagination এটা ধরে কাজ করে।
import Image from "next/image";
import type { Block, BlockOf } from "@/lib/types";
import { Inline, plain } from "./Inline";
import { CodeFigure } from "./CodeFigure";
import { VideoCard } from "./VideoCard";
import { LockedSlot } from "@/components/lock/LockedSlot";

// Output-এ input() দিয়ে দেওয়া মান \x01…\x02 দিয়ে চিহ্নিত
function OutputText({ text }: { text: string }) {
  return <>{text.split(/(\x01[^\x02]*\x02)/).map((p, i) => (p.startsWith("\x01") ? <span key={i} className="in">{p.slice(1, -1)}</span> : p))}</>;
}
const stdinOf = (out?: string) => (out ? [...out.matchAll(/\x01([^\x02]*)\x02/g)].map((m) => m[1]).join("\n") : "");
const FILE_RE = /^[\w./-]+\.\w+$/;

function Code({ b }: { b: BlockOf<"code"> }) {
  const label = b.lang === "terminal" ? "Terminal" : b.lang === "text" ? "Text" : "Python";
  const share = b.lang !== "terminal" && FILE_RE.test(b.file) && b.file !== "main.py" ? b.file : undefined;
  return (
    <div className="codewrap" data-bid={b.id}>
      <CodeFigure
        id={b.id}
        code={b.code}
        label={label}
        file={b.file}
        numbered={b.lang === "python"}
        variant={b.lang === "python" ? "" : b.lang === "terminal" ? "term" : "text"}
        runnable={b.lang === "python"}
        defaultStdin={stdinOf(b.output)}
        registerAs={share}
      />
      {b.output && (
        <figure className="output"><figcaption>Output</figcaption><pre><OutputText text={b.output} /></pre></figure>
      )}
    </div>
  );
}

function Stars({ n }: { n: number }) {
  if (!n) return null;
  return <span className="stars" title={`গুরুত্ব ${n}/3`} aria-label={`গুরুত্ব ${n} তারকা`}>{"★".repeat(n)}{"☆".repeat(3 - n)}</span>;
}

export function BlockView({ b, ch }: { b: Block; ch: number }) {
  switch (b.t) {
    case "chapter":
      return (
        <header className="chap-head" data-bid={b.id}>
          <p className="chap-kicker">{ch === 12 ? "পরিশিষ্ট" : "অধ্যায়"}</p>
          <p className="chap-n" aria-hidden="true">{ch === 12 ? "✦" : b.num.replace(/^অধ্যায়\s*/, "")}</p>
          <h1><span className="sr-only">{b.num}: </span>{b.title}</h1>
          <div className="rule" />
          {b.intro.map((x, i) => <p key={i} className="lead"><Inline text={x} /></p>)}
          {b.video && <VideoCard v={b.video} big />}
        </header>
      );
    case "h2":
      return (
        <>
          <h2 id={b.sid} data-bid={b.id}><Inline text={b.text} />{b.tag && <span className="syl">Syllabus {b.tag}</span>}</h2>
          {b.video && <VideoCard v={b.video} />}
        </>
      );
    case "h3": return <h3 data-bid={b.id}><Inline text={b.text} /></h3>;
    case "p": return <p data-bid={b.id}><Inline text={b.text} /></p>;
    case "bullets": return <ul data-bid={b.id}>{b.items.map((x, i) => <li key={i}><Inline text={x} /></li>)}</ul>;
    case "numbers": return <ol data-bid={b.id}>{b.items.map((x, i) => <li key={i}><Inline text={x} /></li>)}</ol>;
    case "table":
      return (
        <div className="tbl" data-bid={b.id}>
          <table>
            <thead><tr>{b.headers.map((h, i) => <th key={i}><Inline text={h} /></th>)}</tr></thead>
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={b.mono.includes(j) ? "m" : undefined}><Inline text={c} /></td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case "example":
      return (
        <div className="example" data-bid={b.id}>
          <p className="ex-title"><span className="ex-label">{b.label}</span><Inline text={b.title} /></p>
          <p className="problem"><strong>সমস্যা:</strong> <Inline text={b.problem} /></p>
        </div>
      );
    case "syntax":
      return (
        <div className="syntax" data-bid={b.id}>
          <p className="box-title">Syntax</p>
          <CodeFigure code={b.code} label="Syntax" numbered={false} variant="mini" />
          {b.note && <p><Inline text={b.note} /></p>}
        </div>
      );
    case "code": return <Code b={b} />;
    case "explain":
      return (
        <details className="explain" open data-bid={b.id}>
          <summary>লাইন-বাই-লাইন ব্যাখ্যা</summary>
          <div className="tbl"><table><thead className="sr-only"><tr><th>লাইন</th><th>কোড</th><th>ব্যাখ্যা</th></tr></thead><tbody>{b.rows.map((r, i) => (
            <tr key={i}><td className="lab">{r.label}</td><td className="snip"><pre>{r.snippet}</pre></td><td><Inline text={r.text} /></td></tr>
          ))}</tbody></table></div>
        </details>
      );
    case "box":
      return (
        <aside className={`box ${b.kind}`} data-bid={b.id}>
          <p className="box-title">{b.title}</p>
          {b.items.map((it, i) =>
            it.k === "p" ? <p key={i}><Inline text={it.text} /></p>
              : it.k === "bullets" ? <ul key={i}>{it.items.map((x, j) => <li key={j}><Inline text={x} /></li>)}</ul>
                : <CodeFigure key={i} code={it.code} label="Python" numbered={false} variant="mini" />)}
        </aside>
      );
    case "mistakes":
      return (
        <aside className="box mistake" data-bid={b.id}>
          <p className="box-title">সাধারণ ভুল</p>
          {b.items.map((m, i) => (
            <div className="mk" key={i}>
              <div className="mk-col bad">
                <p className="mk-h">ভুল</p>
                <CodeFigure code={m.wrong} label="Python" numbered={false} variant="mini" runnable />
                {m.wrongOut && <p className="err">ফল: <code>{m.wrongOut}</code></p>}
              </div>
              <div className="mk-col good">
                <p className="mk-h">সঠিক</p>
                <CodeFigure code={m.right} label="Python" numbered={false} variant="mini" runnable />
              </div>
              <p className="why"><Inline text={m.why} /></p>
            </div>
          ))}
        </aside>
      );
    case "img":
      return (
        <figure className="pic" data-bid={b.id}>
          <Image src={b.src} alt={plain(b.caption)} width={b.width} height={b.height} sizes="(max-width: 760px) 92vw, 680px" draggable={false} />
          <figcaption><Inline text={b.caption} /></figcaption>
        </figure>
      );
    case "q":
      return (
        <div className="q" data-bid={b.id}>
          <span className="qn">{b.num}</span>
          <div className="qt"><Inline text={b.text} /></div>
          <Stars n={b.stars} />
          {b.ref && <span className="qref">{b.ref}</span>}
        </div>
      );
    case "section": return <p className="qsec" data-bid={b.id}>{b.text}</p>;
    case "paperhead":
      return (
        <div className="paperq" data-bid={b.id}>
          {b.lines.map((l, i) => <p key={i} className={`pl${Math.min(i, 2)}`}>{l}</p>)}
          <p className="pmeta"><span>{b.left}</span><span>{b.right}</span></p>
          <p className="pinst">{b.instr}</p>
        </div>
      );
    case "locked": return <LockedSlot ch={ch} group={b.group} first={b.first} />;
  }
}

export function Blocks({ blocks, ch }: { blocks: Block[]; ch: number }) {
  return <>{blocks.map((b) => <BlockView key={b.id} b={b} ch={ch} />)}</>;
}
