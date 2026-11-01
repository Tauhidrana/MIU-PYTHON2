"use client";
// App হিসেবে install আর অফলাইনে পড়া: service worker register করা, পুরো বই অফলাইনে রাখা হলে একবার জানানো,
// আর হোম পাতায় "অ্যাপ ইনস্টল করো" বাটন (Chrome/Android-এ সরাসরি install, iPhone-এ Share → Add to Home Screen)
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

export function PwaSetup() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); deferred = e as InstallEvent; notify(); };
    const onInstalled = () => { deferred = null; notify(); };
    addEventListener("beforeinstallprompt", onPrompt);
    addEventListener("appinstalled", onInstalled);

    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type !== "offline-ready") return;
      try {
        if (localStorage.getItem("offlineReady")) return;
        localStorage.setItem("offlineReady", "1");
      } catch { /* storage বন্ধ */ }
      setMsg("✓ পুরো বই এখন অফলাইনেও পড়া যাবে");
      setTimeout(() => setMsg(""), 4000);
    };
    navigator.serviceWorker.addEventListener("message", onMsg);
    const reg = () => navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    if (document.readyState === "complete") reg(); else addEventListener("load", reg, { once: true });
    return () => {
      removeEventListener("beforeinstallprompt", onPrompt);
      removeEventListener("appinstalled", onInstalled);
      navigator.serviceWorker.removeEventListener("message", onMsg);
    };
  }, []);

  return <div className={`toast${msg ? " show" : ""}`} role="status" aria-live="polite">{msg}</div>;
}

export function InstallButton() {
  const [mode, setMode] = useState<"none" | "prompt" | "ios">("none");
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    if (standalone) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const update = () => setMode(deferred ? "prompt" : ios ? "ios" : "none");
    update();
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  if (mode === "none") return null;
  const click = async () => {
    if (mode === "ios" || !deferred) { setHelp((h) => !h); return; }
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    deferred = null;
    notify();
  };
  return (
    <>
      <button type="button" className="btn" onClick={click}>📲 অ্যাপ ইনস্টল করো</button>
      {help && <p className="install-help">Safari-তে নিচের <strong>Share</strong> বাটন চাপো → <strong>Add to Home Screen</strong>। তারপর অফলাইনেও বই পড়া যাবে।</p>}
    </>
  );
}
