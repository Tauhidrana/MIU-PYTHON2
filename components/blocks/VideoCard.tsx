"use client";
// টপিকের YouTube ভিডিও — প্রথমে শুধু ছবি, চাপলে তবেই player লোড হয় (পাতা দ্রুত থাকে)
import { useState } from "react";
import type { Video } from "@/lib/types";
import { bn } from "@/lib/site";

const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export function VideoCard({ v, big }: { v: Video; big?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const kind = big ? "পুরো অধ্যায়ের ভিডিও ক্লাস" : "এই টপিকের ভিডিও";
  const when = `${MONTHS[Number(v.date.slice(5, 7)) - 1]} ${bn(v.date.slice(0, 4))}`;
  return (
    <div className={`yt${big ? " big" : ""}${playing ? " playing" : ""}`} data-code="">
      {playing ? (
        <div className="yt-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={v.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <button type="button" className="yt-play" aria-label={`ভিডিও চালাও: ${v.title}`} onClick={() => setPlaying(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" decoding="async" width={320} height={180} />
          <span className="icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
      <div className="yt-meta">
        <p className="yt-k"><span className={`yt-lang ${v.lang}`}>{v.lang === "bn" ? "বাংলা" : "হিন্দি"}</span>{kind} · {when}</p>
        <p className="yt-t">{v.title}</p>
        <p className="yt-c">{v.channel} · <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener">YouTube-এ দেখো ↗</a></p>
      </div>
    </div>
  );
}
