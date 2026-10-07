"use client";
import { useEffect, useState } from "react";
import { FeedbackForm, Rating } from "./FeedbackForm";

export function FeedbackTabs({ chapters }: { chapters: string[] }) {
  const [tab, setTab] = useState<"review" | "report">("review");
  useEffect(() => { if (location.hash === "#report") setTab("report"); }, []);
  const opts = chapters.map((c) => <option key={c}>{c}</option>);
  return (
    <>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "review"} aria-controls="review" onClick={() => setTab("review")}>বইয়ের রিভিউ</button>
        <button role="tab" aria-selected={tab === "report"} aria-controls="report" onClick={() => setTab("report")}>ভুল রিপোর্ট / পরামর্শ</button>
      </div>
      <FeedbackForm kind="বইয়ের রিভিউ" id="review" submitLabel="রিভিউ পাঠাও" hidden={tab !== "review"}>
        <p className="fld-label">সব মিলিয়ে বইটাকে কত দেবে?</p>
        <Rating big />
        <div className="row2">
          <label className="fld"><span>নাম</span><input name="name" required autoComplete="name" /></label>
          <label className="fld"><span>প্রতিষ্ঠান</span><input name="institute" placeholder="যেমন: Rajshahi Polytechnic Institute" /></label>
        </div>
        <div className="row2">
          <label className="fld"><span>টেকনোলজি ও পর্ব</span><input name="technology" placeholder="যেমন: CST, ৩য় পর্ব" /></label>
          <label className="fld"><span>সবচেয়ে কাজের অধ্যায়</span><select name="best_chapter" defaultValue=""><option value="">— বেছে নাও —</option>{opts}</select></label>
        </div>
        <label className="fld"><span>তোমার রিভিউ</span><textarea name="message" rows={6} required placeholder="কী ভালো লেগেছে, কী আরও ভালো হতে পারত…" /></label>
        <label className="fld"><span>Email (ঐচ্ছিক — উত্তর চাইলে)</span><input type="email" name="email" autoComplete="email" /></label>
      </FeedbackForm>
      <FeedbackForm kind="ভুল রিপোর্ট / পরামর্শ" id="report" submitLabel="পাঠাও" hidden={tab !== "report"}>
        <div className="row2">
          <label className="fld"><span>ধরন</span><select name="type" required>
            <option>কোডে ভুল</option><option>লেখায় বা বানানে ভুল</option><option>ব্যাখ্যা বোঝা যায়নি</option><option>বোর্ড প্রশ্ন বা উত্তরে ভুল</option><option>নতুন বিষয় যোগের পরামর্শ</option><option>অন্যান্য</option>
          </select></label>
          <label className="fld"><span>অধ্যায়</span><select name="chapter" required>{opts}</select></label>
        </div>
        <label className="fld"><span>Section বা পৃষ্ঠা (যেমন 5.4, উদাহরণ 5.6)</span><input name="where" /></label>
        <label className="fld"><span>বিস্তারিত</span><textarea name="message" rows={6} required /></label>
        <div className="row2">
          <label className="fld"><span>নাম (ঐচ্ছিক)</span><input name="name" autoComplete="name" /></label>
          <label className="fld"><span>Email (ঐচ্ছিক)</span><input type="email" name="email" autoComplete="email" /></label>
        </div>
      </FeedbackForm>
    </>
  );
}
