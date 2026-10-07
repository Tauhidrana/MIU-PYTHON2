"use client";
// লক করা অংশের জায়গা: লক থাকলে ঝাপসা skeleton + আনলক card, খোলা থাকলে API থেকে আসা block-গুলো
import { useRef } from "react";
import { Blocks } from "@/components/blocks/Blocks";
import { useLock } from "./LockProvider";
import { FB_URL, PDF_PRICE, bn } from "@/lib/site";

const LockIcon = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /><circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
  </svg>
);
const SKEL_FIRST = "h l l s c l s l l s c l".split(" ");

export function LockedSlot({ ch, group, first }: { ch: number; group: number; first: boolean }) {
  const lock = useLock();
  const input = useRef<HTMLInputElement>(null);
  const blocks = lock?.groups?.[group];
  if (blocks) return <div className="unlocked"><Blocks blocks={blocks} ch={ch} /></div>;

  if (!first) {
    return (
      <div className="locked slim" data-ch={ch}>
        <a className="lock-card slim" href="#unlock"><span className="lock-icon"><LockIcon size={18} /></span><span>এই অংশ লক করা — <u>আনলক কোড দাও</u></span></a>
      </div>
    );
  }
  const busy = lock?.state === "loading";
  return (
    <div className="locked first" data-ch={ch}>
      <div className="lock-preview" aria-hidden="true">{SKEL_FIRST.map((k, i) => <span key={i} className={`sk sk-${k}`} />)}</div>
      <div className="lock-card" id="unlock">
        <div className="lock-icon"><LockIcon /></div>
        <p className="lock-badge">PDF ক্রেতাদের জন্য</p>
        <p className="lock-h">অনুশীলনী ও বোর্ড প্রশ্নের উত্তর লক করা</p>
        <p className="lock-text">PDF কিনলে একটা <strong>আনলক কোড</strong> পাবে — কোডটা একবার দিলেই এই browser-এ সব অধ্যায়ের অনুশীলনী আর বোর্ড প্রশ্নের উত্তর খুলে যাবে।</p>
        <p className="lock-price">PDF-এর দাম: <strong>{bn(PDF_PRICE)} টাকা</strong></p>
        <form
          className="lock-form"
          onSubmit={(e) => {
            e.preventDefault();
            const code = input.current?.value.trim();
            if (code && lock) lock.submit(code).catch(() => input.current?.select());
          }}
        >
          <input ref={input} name="code" autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="আনলক কোড লেখো" aria-label="আনলক কোড" required />
          <button type="submit" disabled={busy}>আনলক করো</button>
        </form>
        <p className={`lock-status ${lock?.status.cls ?? ""}`} role="status">{lock?.status.msg}</p>
        <ul className="lock-perks"><li>সব অধ্যায়ের অনুশীলনী</li><li>বোর্ড প্রশ্নের উত্তর</li><li>একবারেই সব খোলে</li></ul>
        <p className="lock-buy">PDF কিনতে Facebook-এ মেসেজ দাও · <a href={FB_URL} target="_blank" rel="noopener">facebook.com/kazitauhidrana ↗</a></p>
        <p className="lock-free">প্রথম ২টি অধ্যায়ের অনুশীলনী সবার জন্য খোলা</p>
      </div>
    </div>
  );
}
