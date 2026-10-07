"use client";
// সব ফর্ম (রিভিউ, ভুল রিপোর্ট, অধ্যায়ের মতামত, PDF আগ্রহ) → লেখকের Gmail।
// Web3Forms key থাকলে Web3Forms, না থাকলে FormSubmit — পুরনো site/assets/app.js-এর মতোই।
import { useState } from "react";
import { FORMS } from "@/lib/site";

type Props = { kind: string; id?: string; className?: string; submitLabel: string; children: React.ReactNode; footer?: React.ReactNode; hidden?: boolean };

export function FeedbackForm({ kind, id, className, submitLabel, children, footer, hidden }: Props) {
  const [status, setStatus] = useState<{ cls: string; msg: string }>({ cls: "", msg: "" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const useW3 = FORMS.WEB3FORMS_KEY && !FORMS.WEB3FORMS_KEY.startsWith("YOUR_");
    // একই নামের একাধিক checkbox (যেমন পেমেন্টের মাধ্যম) কমা দিয়ে জোড়া লাগে
    const data: Record<string, string> = {};
    new FormData(form).forEach((v, k) => { data[k] = data[k] ? `${data[k]}, ${v}` : String(v); });
    if (data.price === "other") {
      if (!data.price_other) {
        setStatus({ cls: "err", msg: "তোমার প্রস্তাবিত দামটা লেখো।" });
        form.querySelector<HTMLInputElement>("[name=price_other]")?.focus();
        return;
      }
      data.price = data.price_other;
    }
    delete data.price_other;
    if (data.botcheck) return;
    delete data.botcheck;
    let extra = data.rating ? ` — ${"★".repeat(+data.rating)} (${data.rating}/5)` : "";
    if (data.price) extra += ` — দাম: ৳${data.price}${data.interest ? ` — ${data.interest}` : ""}`;
    const subject = `[${FORMS.SITE_NAME}] ${kind}${extra}`;
    const [url, payload] = useW3
      ? ["https://api.web3forms.com/submit", { access_key: FORMS.WEB3FORMS_KEY, subject, from_name: data.name ? `${data.name} (Python বই)` : "Python বই — পাঠক", form: kind, page: document.title, ...data }]
      : [`https://formsubmit.co/ajax/${encodeURIComponent(FORMS.EMAIL)}`, { _subject: subject, _template: "table", _captcha: "false", form: kind, page: document.title, ...data }];
    setBusy(true);
    setStatus({ cls: "", msg: "পাঠানো হচ্ছে…" });
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
      const res = await r.json();
      if (res.success === true || res.success === "true") {
        form.reset();
        setStatus({ cls: "ok", msg: "ধন্যবাদ! তোমার মতামত লেখকের কাছে পৌঁছে গেছে।" });
      } else throw new Error(res.message);
    } catch {
      setStatus({ cls: "err", msg: "পাঠানো যায়নি। Internet সংযোগ দেখে আবার চেষ্টা করো।" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`fb-form ${className ?? ""}`} id={id} onSubmit={onSubmit} hidden={hidden}>
      {children}
      <input type="checkbox" name="botcheck" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="btn-primary" disabled={busy}>{submitLabel}</button>
      <p className={`status ${status.cls}`} role="status">{status.msg}</p>
      {footer}
    </form>
  );
}

export function Rating({ big }: { big?: boolean }) {
  return (
    <div className={`rate${big ? " big" : ""}`} role="radiogroup" aria-label="রেটিং">
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n}>
          <input type="radio" name="rating" value={n} required={n === 1} aria-label={`${n} তারকা`} />
          <span aria-hidden="true">★</span><em>{n}</em>
        </label>
      ))}
    </div>
  );
}
