import type { MetadataRoute } from "next";
import { SITE_DESC } from "@/lib/site";

// Chrome/Android-এ "Install app" — বইটা আলাদা app হিসেবে খোলে, আর service worker (public/sw.js) দিয়ে অফলাইনেও চলে
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Python বই — Application Development Using Python",
    short_name: "Python বই",
    description: SITE_DESC,
    lang: "bn",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#EDE7DB",
    theme_color: "#EDE7DB",
    categories: ["education", "books"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "পড়া শুরু করো", url: "/chapters/ch01", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "কোড রানার", url: "/runner", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
