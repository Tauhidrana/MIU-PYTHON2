import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, IBM_Plex_Mono } from "next/font/google";
import { Guard } from "@/components/chrome/Guard";
import { OG_SITE_NAME, SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "600", "700"], variable: "--font-hind", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — অনলাইন বই`, template: "%s — Python বই" },
  description: SITE_DESC,
  icons: { icon: "/img/favicon.png" },
  robots: { index: true, follow: true, noarchive: true },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website", siteName: OG_SITE_NAME, locale: "bn_BD",
    images: [{ url: "/img/og-cover.png", width: 1200, height: 630, alt: "Application Development Using Python — বইয়ের প্রচ্ছদ" }],
  },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#EDE7DB" }, { media: "(prefers-color-scheme: dark)", color: "#0C0D11" }],
};

// রং বদলানোর আগেই পাতা আঁকা হলে ঝলক দেখা যায় — তাই <head>-এই theme বসে। পছন্দ না থাকলে system-এর রং।
const THEME_JS = `try{var t=localStorage.getItem("theme");if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${hind.variable} ${plex.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_JS }} /></head>
      <body>
        <a className="skip" href="#main">মূল লেখায় যাও</a>
        {children}
        <Guard />
      </body>
    </html>
  );
}
