import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { TocButton } from "./TocDrawer";

export function TopBar({ reader }: { reader?: React.ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link className="brand" href="/" aria-label="হোম — Python বই">
          <span className="brand-logo"><Image src="/img/logo.png" alt="" width={56} height={31} /></span>
          <span className="brand-t">Python বই</span>
        </Link>
        {reader}
        <nav className="topnav" aria-label="প্রধান মেনু">
          <TocButton />
          <Link href="/#chapters" className="hide-sm">অধ্যায়</Link>
          <Link href="/runner" className="hide-sm">কোড রানার</Link>
          <Link href="/feedback" className="hide-sm">রিভিউ ও মতামত</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
