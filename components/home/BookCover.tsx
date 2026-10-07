"use client";
// হোমপেজের বই: navy কাপড়ের প্রচ্ছদ কব্জা ধরে খুলে বাম পাতা হয়ে যায়, ডানে ভেতরের title পাতা।
// বন্ধ অবস্থায় বইটা মাঝখানে থাকে, খোলার সাথে সাথে পুরো spread মাঝখানে সরে আসে।
// prefers-reduced-motion থাকলে animation ছাড়াই খোলা অবস্থায় দেখায়।
import Image from "next/image";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.3, 0.75, 0.25, 1] as const;

export function BookCover() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), reduce ? 0 : 500);
    return () => clearTimeout(t);
  }, [reduce]);
  const tr = reduce ? { duration: 0 } : { duration: 1.3, ease: EASE };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="hero-book" role="img" aria-label="বইয়ের প্রচ্ছদ — Application Development Using Python, লেখক Kazi Tauhid Rana">
        <m.div className="hb-spread" initial={false} animate={{ x: open ? "0%" : "-25%" }} transition={tr}>
          <div className="hb-page">
            <Image src="/img/cover.png" alt="" fill sizes="(max-width: 900px) 46vw, 300px" preload fetchPriority="high" />
          </div>
          <m.div className="hb-cover" initial={false} animate={{ rotateY: open ? -180 : 0 }} transition={tr} aria-hidden="true">
            <div className="hb-front">
              <span className="hb-kicker">MIU · Learn Grow Succeed</span>
              <span className="hb-title">Application<br />Development</span>
              <span className="hb-sub">Using Python</span>
              <span className="hb-rule" />
              <span className="hb-author">Kazi Tauhid Rana</span>
            </div>
            <div className="hb-back">
              <span className="hb-ex">Application Development Using Python</span>
              <span className="hb-ex-line" />
              <span className="hb-ex-sm">© ২০২৬ Kazi Tauhid Rana · সর্বস্বত্ব সংরক্ষিত</span>
              <span className="hb-ex-sm">MIU Platform · Learn Grow Succeed</span>
            </div>
          </m.div>
        </m.div>
      </div>
    </LazyMotion>
  );
}
