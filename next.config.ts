import type { NextConfig } from "next";

const pages = ["runner", "feedback", "pdf", "copyright"];

const config: NextConfig = {
  // লক করা অনুশীলনী শুধু server function-এর সাথে যায়, public/-এ না
  outputFileTracingIncludes: { "/api/exercise": ["./content/locked/**"] },
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"], remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
  // পুরনো site-এর .html link-গুলো (শেয়ার করা, Google-এ থাকা) নতুন ঠিকানায় যায়
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/chapters/:slug.html", destination: "/chapters/:slug", permanent: true },
      ...pages.map((p) => ({ source: `/${p}.html`, destination: `/${p}`, permanent: true })),
    ];
  },
};
export default config;
