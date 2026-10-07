import { SimplePage } from "@/components/chrome/SimplePage";
import { FeedbackTabs } from "@/components/forms/FeedbackTabs";
import { getChapters } from "@/lib/content";
import { chapterLabel, SITE_URL } from "@/lib/site";

export const metadata = { title: "রিভিউ ও মতামত", alternates: { canonical: `${SITE_URL}/feedback` }, openGraph: { title: "রিভিউ ও মতামত — Python বই", url: `${SITE_URL}/feedback` } };

export default function FeedbackPage() {
  const chapters = getChapters().map((c) => `${chapterLabel(c.n)} — ${c.title}`);
  return (
    <SimplePage active="feedback">
      <h1>রিভিউ ও মতামত</h1>
      <p className="lead">তোমার লেখা সরাসরি লেখকের email-এ যাবে, website-এ প্রকাশ হবে না।</p>
      <FeedbackTabs chapters={chapters} />
    </SimplePage>
  );
}
