import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, IBM_Plex_Mono, Noto_Serif_Bengali } from "next/font/google";
import { Guard } from "@/components/chrome/Guard";
import { PwaSetup } from "@/components/chrome/Pwa";
import { OG_SITE_NAME, SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "600", "700"], variable: "--font-hind", display: "swap" });
// "বইয়ের মতো" ফন্ট — পাঠক Aa থেকে বেছে নিলে তবেই download হয়
const serif = Noto_Serif_Bengali({ subsets: ["bengali", "latin"], weight: ["400", "600", "700"], variable: "--font-serif", display: "swap", preload: false });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — অনলাইন বই`, template: "%s — Python বই" },
  description: SITE_DESC,
  icons: { icon: "/img/favicon.png", apple: "/icons/apple-touch-icon.png" },
  applicationName: "Python বই",
  appleWebApp: { capable: true, title: "Python বই", statusBarStyle: "default" },
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
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F3EEE3" }, { media: "(prefers-color-scheme: dark)", color: "#0E0F13" }],
};

// রং/লেখার মাপ/ফন্ট বদলানোর আগেই পাতা আঁকা হলে ঝলক দেখা যায় — তাই <head>-এই বসে। রং পছন্দ না থাকলে system-এর রং।
// মান লেখে components/chrome/ReadingSettings.tsx
const THEME_JS = `try{var d=document.documentElement,s=localStorage,t=s.getItem("theme");if(t!=="dark"&&t!=="light"&&t!=="sepia")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.dataset.theme=t;var z=s.getItem("rsize");if(z&&/^[0-4]$/.test(z))d.dataset.rsize=z;if(s.getItem("rfont")==="serif")d.dataset.rfont="serif"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${hind.variable} ${plex.variable} ${serif.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_JS }} /></head>
      <body>
        <a className="skip" href="#main">মূল লেখায় যাও</a>
        {children}
        <Guard />
        <PwaSetup />
      </body>
    </html>
  );
}
