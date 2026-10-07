import { getChapters } from "@/lib/content";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { TocDrawer } from "./TocDrawer";

// রানার, মতামত, PDF, কপিরাইট — একই কাঠামো
export function SimplePage({ active, wide, children }: { active?: "runner" | "feedback"; wide?: boolean; children: React.ReactNode }) {
  const links = getChapters().map(({ n, slug, short }) => ({ n, slug, short }));
  return (
    <>
      <TopBar />
      <main id="main" className={wide ? "runner-wrap" : "page-wrap paper sheet"}>{children}</main>
      <Footer />
      <BottomNav active={active} />
      <TocDrawer chapters={links} />
    </>
  );
}
