import { SimplePage } from "@/components/chrome/SimplePage";
import { FeedbackForm } from "@/components/forms/FeedbackForm";
import { bn, FB_URL, SITE_URL } from "@/lib/site";

export const metadata = { title: "বইয়ের PDF — আগ্রহ ও দাম", alternates: { canonical: `${SITE_URL}/pdf` }, openGraph: { title: "বইয়ের PDF — আগ্রহ ও দাম — Python বই", url: `${SITE_URL}/pdf` } };

const WANT = ["হ্যাঁ, অবশ্যই নেব", "দাম ঠিক থাকলে নেব", "এখনই না, পরে ভাবব"];
const PRICES = [50, 80, 100, 150, 200];
const PAYS = ["বিকাশ", "নগদ", "রকেট", "অন্য"];

export default function PdfPage() {
  return (
    <SimplePage>
      <p className="tag">শীঘ্রই আসছে</p>
      <h1>বইয়ের PDF</h1>
      <p className="lead">পুরো বইটার PDF সংস্করণ তৈরি হচ্ছে — অফলাইনে, মোবাইল বা কম্পিউটারে যেকোনো জায়গায় পড়ার জন্য। কতজন নিতে চাও আর কত দাম তোমাদের কাছে ঠিক মনে হয়, সেটা জেনেই দাম ঠিক করা হবে।</p>
      <div className="callout">
        <p><strong>PDF নিতে চাইলে Facebook-এ মেসেজ দাও:</strong> <a href={FB_URL} target="_blank" rel="noopener">facebook.com/kazitauhidrana ↗</a></p>
        <p>PDF কিনলে সাথে একটা <strong>আনলক কোড</strong> পাবে — সেটা দিয়ে এই website-এ সব অধ্যায়ের অনুশীলনী আর বোর্ড প্রশ্নের উত্তর খুলে যাবে।</p>
      </div>
      <ul>
        <li>এই website-এর পুরো বই — ১১টা অধ্যায় আর বোর্ড প্রশ্নের পরিশিষ্ট</li>
        <li>তৈরি হলেই তোমার মোবাইল নম্বরে বা email-এ জানানো হবে</li>
        <li>এখন কোনো টাকা দিতে হবে না — এটা শুধু আগ্রহ আর মতামত জানানোর ফর্ম</li>
      </ul>
      <FeedbackForm kind="PDF আগ্রহ ও দাম" className="pdf-form" submitLabel="আগ্রহ জানাও"
        footer={<p className="note-sm">তোমার নম্বর আর email শুধু PDF-এর খবর জানাতে ব্যবহার হবে, কারো সাথে শেয়ার করা হবে না।</p>}>
        <fieldset><legend>তুমি কি PDF নিতে আগ্রহী?</legend>
          <div className="chips">{WANT.map((t) => <label className="chip" key={t}><input type="radio" name="interest" value={t} required /><span>{t}</span></label>)}</div>
        </fieldset>
        <fieldset><legend>তোমার মতে PDF-এর ন্যায্য দাম কত?</legend>
          <div className="chips">
            {PRICES.map((n) => <label className="chip" key={n}><input type="radio" name="price" value={n} required /><span>৳ {bn(n)}</span></label>)}
            <label className="chip"><input type="radio" name="price" value="other" /><span>অন্য</span></label>
          </div>
          <label className="fld other-price"><span>তোমার প্রস্তাবিত দাম (টাকা)</span><input type="number" name="price_other" min={0} max={5000} inputMode="numeric" placeholder="যেমন: ১২০" /></label>
        </fieldset>
        <div className="row2">
          <label className="fld"><span>নাম</span><input name="name" required autoComplete="name" /></label>
          <label className="fld"><span>মোবাইল নম্বর</span><input name="phone" type="tel" required inputMode="tel" autoComplete="tel" pattern="(\+?88)?01[3-9][0-9]{8}" placeholder="01XXXXXXXXX" title="১১ সংখ্যার নম্বর, যেমন 017XXXXXXXX" /></label>
        </div>
        <div className="row2">
          <label className="fld"><span>প্রতিষ্ঠান</span><input name="institute" placeholder="যেমন: Rajshahi Polytechnic Institute" /></label>
          <label className="fld"><span>টেকনোলজি ও পর্ব</span><input name="technology" placeholder="যেমন: CST, ৩য় পর্ব" /></label>
        </div>
        <fieldset><legend>কীভাবে টাকা দিতে সুবিধা? <small>(একাধিক বাছতে পারো)</small></legend>
          <div className="chips">{PAYS.map((t) => <label className="chip" key={t}><input type="checkbox" name="payment" value={t} /><span>{t}</span></label>)}</div>
        </fieldset>
        <label className="fld"><span>Email (ঐচ্ছিক)</span><input type="email" name="email" autoComplete="email" /></label>
        <label className="fld"><span>PDF-এ আর কী চাও? (ঐচ্ছিক)</span><textarea name="message" rows={3} placeholder="যেমন: অধ্যায়ের শেষে বেশি practice প্রশ্ন, প্রিন্ট করার সুবিধা…" /></label>
      </FeedbackForm>
    </SimplePage>
  );
}
