import { SimplePage } from "@/components/chrome/SimplePage";
import { Runner } from "@/components/runner/Runner";
import { SITE_URL } from "@/lib/site";

export const metadata = { title: "কোড রানার", alternates: { canonical: `${SITE_URL}/runner` }, openGraph: { title: "কোড রানার — Python বই", url: `${SITE_URL}/runner` } };

export default function RunnerPage() {
  return (
    <SimplePage active="runner" wide>
      <h1>কোড রানার</h1>
      <p className="lead">নিজে Python কোড লেখো আর চালাও। কিছু install করতে হবে না, সব তোমার browser-এই চলে। প্রথমবার চালাতে ১০–২০ সেকেন্ড লাগবে।</p>
      <Runner />
    </SimplePage>
  );
}
