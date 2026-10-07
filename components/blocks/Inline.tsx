// Source-এর ছোট markup: **bold** আর `code` — tools/build_site.py-এর inline()-এর মতো
import { Fragment } from "react";

function codeSpans(t: string, key: string) {
  return t.split(/(`[^`]+`)/).map((p, i) =>
    p.startsWith("`") && p.endsWith("`") && p.length > 1 ? <code key={key + i}>{p.slice(1, -1)}</code> : <Fragment key={key + i}>{p}</Fragment>);
}

export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, i) => {
        if (!part) return null;
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{codeSpans(part.slice(2, -2), `b${i}-`)}</strong>;
        if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

// "**…**" ইত্যাদি বাদ দিয়ে সাধারণ লেখা — aria-label, title-এর জন্য
export const plain = (t: string) => t.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
